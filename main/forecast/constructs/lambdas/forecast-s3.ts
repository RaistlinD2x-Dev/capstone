import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';

// TODO Probably need to break this stack apart some more
export class ForecastS3 extends Construct {
  public readonly forecastS3Lambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const forecastS3Role = new iam.Role(this, `forecastS3Role`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // every minute get create array of all stocks selected and push to sfn map iterator
    this.forecastS3Lambda = new lambda.Function(this, `forecastS3Lambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../src/lambdas/forecast-s3'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash',
            '-c',
            'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
          ],
        },
      }),
      role: forecastS3Role,
    });

    // TODO fix permissions
    forecastS3Role.attachInlinePolicy(
      new iam.Policy(this, `forecastS3LambdaPolicy`, {
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
