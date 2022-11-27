import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';

// TODO Probably need to break this stack apart some more
export class ForecastImportJob extends Construct {
  public readonly forecastImportJobLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const forecastImportJobRole = new iam.Role(this, `forecastImportJobRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // every minute get create array of all stocks selected and push to sfn map iterator
    this.forecastImportJobLambda = new lambda.Function(this, `forecastImportJobLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/forecast-import-job'),
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
      role: forecastImportJobRole,
    });

    // TODO fix permissions
    forecastImportJobRole.attachInlinePolicy(
      new iam.Policy(this, `forecastImportJobLambdaPolicy`, {
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
