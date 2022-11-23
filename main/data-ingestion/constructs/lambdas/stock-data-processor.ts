import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class StockDataProcessor extends Construct {
  public readonly stockDataProcessorLambda: Function;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.stockDataProcessorLambda = new lambda.Function(this, 'stockDataProcessorLambda', {
      handler: 'index.handler',
      code: lambda.Code.fromAsset(
        path.join(__dirname, '../../../../src/lambdas/stock-data-processor')
      ),
      runtime: lambda.Runtime.PYTHON_3_9,
    });
  }
}
