import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class GetStocksPrice extends Construct {
  public readonly getStocksPriceLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const getStocksPriceRole = new iam.Role(this, `GetStocksPriceRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.getStocksPriceLambda = new lambda.Function(this, `GetStocksPriceLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/get-stocks-price'),
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
      role: getStocksPriceRole,
    });

    // TODO fix permissions
    getStocksPriceRole.attachInlinePolicy(
      new iam.Policy(this, `GetStocksPriceLambdaPolicy`, {
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
