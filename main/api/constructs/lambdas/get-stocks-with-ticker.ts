import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

// TODO API Gateway was being created and attempting integration before
// the lambda was set up. This threw an error. Investigate this and refactor later

export class GetStocksWithTicker extends Construct {
  public readonly getStocksWithTickerLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const getStocksWithTickerRole = new iam.Role(this, `getStocksWithTickerRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.getStocksWithTickerLambda = new lambda.Function(this, `getStocksWithTickerLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/get-stocks-with-ticker'),
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
      role: getStocksWithTickerRole,
    });

    // TODO fix permissions
    getStocksWithTickerRole.attachInlinePolicy(
      new iam.Policy(this, `getStocksWithTickerLambdaPolicy`, {
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
