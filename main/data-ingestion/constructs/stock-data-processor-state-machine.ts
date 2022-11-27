import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

interface StockDataProcessorStepFunctionProps extends cdk.StackProps {
  perMinuteStockData: Function;
  stockDataProcessor: Function;
}

export class StockDataProcessorStepFunction extends Construct {
  constructor(scope: Construct, id: string, props: StockDataProcessorStepFunctionProps) {
    super(scope, id);

    const stockDataInvoke = new tasks.LambdaInvoke(this, 'stockDataTask', {
      lambdaFunction: props.perMinuteStockData,
      outputPath: '$.Payload',
    });

    const stockDataMap = new sfn.Map(this, 'stockDataMap');

    const stockDataProcessorInvoke = new tasks.LambdaInvoke(this, 'stockDataProcessorTask', {
      lambdaFunction: props.stockDataProcessor,
    });

    // Step Function to orchestrate the capturing of 1 min of stock data for each stock ticker selected
    // send array of selected stock data to map iterator for lambda processing
    const startState = new sfn.Pass(this, 'startState');
    new sfn.StateMachine(this, 'dataIngestionStepFunction', {
      definition: startState
        .next(stockDataInvoke)
        .next(stockDataMap.iterator(stockDataProcessorInvoke)),
    });
  }
}
