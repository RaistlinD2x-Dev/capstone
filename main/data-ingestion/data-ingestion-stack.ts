import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { pythonLambdaGenerator } from '../../utils/python-lambda-generator';

export class DataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stockDataProcessorLambda = pythonLambdaGenerator(
      this,
      'stockDataProcessor',
      `${__dirname}/lambdas/stock-data-processor`
    );

    // Every 5 minutes, between 9AM and 4PM EST, Monday through Friday run the stock data processor Lambda
    // TODO something is wrong with this, only ran once
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0/1 14-21 ? * MON-FRI *)'),
      targets: [new targets.LambdaFunction(stockDataProcessorLambda)],
    });
  }
}
