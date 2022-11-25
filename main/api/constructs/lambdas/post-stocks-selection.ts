import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class PostStocksSelection extends Construct {
  public readonly postStocksSelectionLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const postStockSelectionRole = new iam.Role(this, `postStockSelectionRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.postStocksSelectionLambda = new lambda.Function(this, `postStockSelectionLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(45),
      role: postStockSelectionRole,
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/post-stocks-selection'),
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
    postStockSelectionRole.attachInlinePolicy(
      new iam.Policy(this, `postStockSelectionLambdaPolicy`, {
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
