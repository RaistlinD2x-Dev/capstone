import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class StockDataProcessor extends Construct {
  public readonly stockDataProcessorLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const stockDataProcessorRole = new iam.Role(this, `StockDataProcessorRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // parallel processor for sfn map iterator to put stock data in Timestream
    this.stockDataProcessorLambda = new lambda.Function(this, `StockDataProcessorLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/stock-data-processor'),
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
      role: stockDataProcessorRole,
    });

    // TODO fix permissions
    stockDataProcessorRole.attachInlinePolicy(
      new iam.Policy(this, `StockDataProcessorLambdaPolicy`, {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );
  }
}
