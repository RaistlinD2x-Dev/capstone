import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class PerMinuteStockData extends Construct {
  public readonly perMinuteStockDataLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.perMinuteStockDataLambda = new lambda.Function(this, 'perMinuteStockDataLambda', {
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/per-minute-stock-data')
      ),
      runtime: lambda.Runtime.PYTHON_3_9,
    });
  }
}
