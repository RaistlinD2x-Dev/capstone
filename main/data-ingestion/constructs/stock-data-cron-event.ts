import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions';

interface StockDataCronEventProps extends cdk.StackProps {
  dataIngestionStepFunction: StateMachine;
}

export class stockDataCronEvent extends Construct {
  constructor(scope: Construct, id: string, props: StockDataCronEventProps) {
    super(scope, id);

    // Every 1 minute, between the hours of 9AM and 5PM EST Monday through Friday, invoke the state machine
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.expression('cron(0/1 14-21 ? * MON-FRI *)'),
      targets: [new targets.SfnStateMachine(props.dataIngestionStepFunction)],
    });
  }
}
