import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class GetStocksData extends Construct {
  public readonly getStocksDataLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const getStocksDataRole = new iam.Role(this, `getStocksDataRole`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    this.getStocksDataLambda = new lambda.Function(this, `getStocksDataLambda`, {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(90),
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../../src/lambdas/get-stocks-data'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_9.bundlingImage,
          command: [
            'bash',
            '-c',
            'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
          ],
        },
      }),
      role: getStocksDataRole,
    });

    // TODO fix permissions
    getStocksDataRole.attachInlinePolicy(
      new iam.Policy(this, `getStocksDataLambdaPolicy`, {
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
