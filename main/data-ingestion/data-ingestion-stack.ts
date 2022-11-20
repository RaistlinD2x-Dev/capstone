import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { pythonLambdaGenerator } from '../../utils/python-lambda-generator';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

export class DataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stockDataLambda = pythonLambdaGenerator(
      this,
      'stockData',
      `${__dirname}/lambdas/stock-data`
    );

    const stockDataProcessorLambda = pythonLambdaGenerator(
      this,
      'stockDataProcessor',
      `${__dirname}/lambdas/stock-data-processor`
    );

    const stockDataInvoke = new tasks.LambdaInvoke(this, 'stockDataTask', {
      lambdaFunction: stockDataLambda,
      outputPath: '$.Payload',
    });

    const stockDataMap = new sfn.Map(this, 'stockDataMap');

    const stockDataProcessorInvoke = new tasks.LambdaInvoke(this, 'stockDataProcessorTask', {
      lambdaFunction: stockDataProcessorLambda,
    });

    const startState = new sfn.Pass(this, 'startState');
    const dataIngestionStepFunction = new sfn.StateMachine(this, 'dataIngestionStepFunction', {
      definition: startState
        .next(stockDataInvoke)
        .next(stockDataMap.iterator(stockDataProcessorInvoke)),
    });

    // Every 1 minute, between the hours of 9AM and 5PM EST Monday through Friday, invoke the state machine
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0/1 14-21 ? * MON-FRI *)'),
      targets: [new targets.SfnStateMachine(dataIngestionStepFunction)],
    });
  }
}
