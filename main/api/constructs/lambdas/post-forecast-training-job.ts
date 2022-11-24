import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class ForecastTrainingJob extends Construct {
  public readonly forecastTrainingJobLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const forecastTrainingJobRole = new iam.Role(this, `forecastTrainingJobRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.forecastTrainingJobLambda = new lambda.Function(this, `forecastTrainingJobLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(45),
      role: forecastTrainingJobRole,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/post-forecast-training-job'),
        {
          bundling: {
            image: lambda.Runtime.PYTHON_3_9.bundlingImage,
            command: [
              'bash',
              '-c',
              'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
            ],
          },
        }
      ),
    });

    // TODO fix permissions
    forecastTrainingJobRole.attachInlinePolicy(
      new iam.Policy(this, `forecastTrainingJobLambdaPolicy`, {
        statements: [
          new iam.PolicyStatement({
            // TODO Possibly pass this in as a parameter to the function
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );
  }
}
