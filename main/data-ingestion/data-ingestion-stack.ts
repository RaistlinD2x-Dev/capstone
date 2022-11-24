import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StockDataProcessor } from './constructs/lambdas/stock-data-processor';
import { PerMinuteStockData } from './constructs/lambdas/per-minute-stock-data';
import { StockDataProcessorStateMachine } from './constructs/stock-data-processor-state-machine';

export class DataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // this got shifted to 5 minutes but I'm too lazy to change the name
    const perMinuteStockData = new PerMinuteStockData(this, 'PerMinuteStockData');

    const stockDataProcessor = new StockDataProcessor(this, 'StockDataProcessor');

    new StockDataProcessorStateMachine(this, 'StockDataProcessorStateMachine', {
      perMinuteStockData: perMinuteStockData.perMinuteStockDataLambda,
      stockDataProcessor: stockDataProcessor.stockDataProcessorLambda,
    });
  }
}
