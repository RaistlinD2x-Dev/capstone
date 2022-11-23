import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

// TODO API Gateway was being created and attempting integration before
// the lambda was set up. This threw an error. Investigate this and refactor later

export class GetStocks extends Construct {
  public readonly getStocksLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const getStocksRole = new iam.Role(this, `getStocksRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.getStocksLambda = new lambda.Function(this, `getStocksLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../src/lambdas/get-stocks'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash',
            '-c',
            'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
          ],
        },
      }),
      role: getStocksRole,
    });

    // TODO fix permissions
    getStocksRole.attachInlinePolicy(
      new iam.Policy(this, `getStocksLambdaPolicy`, {
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
