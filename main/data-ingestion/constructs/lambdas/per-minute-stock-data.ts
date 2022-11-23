import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class PerMinuteStockData extends Construct {
  public readonly perMinuteStockDataLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const perMinuteStockDataRole = new iam.Role(this, `perMinuteStockDataRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // every minute get create array of all stocks selected and push to sfn map iterator
    this.perMinuteStockDataLambda = new lambda.Function(this, `perMinuteStockDataLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/per-minute-stock-data'),
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
      role: perMinuteStockDataRole,
    });

    // TODO fix permissions
    perMinuteStockDataRole.attachInlinePolicy(
      new iam.Policy(this, `perMinuteStockDataLambdaPolicy`, {
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
