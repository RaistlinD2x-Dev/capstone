import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class DataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'for stockDataGetterLambda',
    });

    const stockDataProcessorLambda = new lambda.Function(
      this,
      'stockDataProcessorLambda',
      {
        runtime: lambda.Runtime.PYTHON_3_9,
        handler: 'index.handler',
        code: lambda.Code.fromAsset(
          path.join(__dirname, 'lambdas/stock-data-processor'),
          {
            bundling: {
              image: Runtime.PYTHON_3_9.bundlingImage,
              command: [
                'bash',
                '-c',
                'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
              ],
            },
          }
        ),
        role: lambdaRole,
      }
    );

    // TODO fix permissions
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, 'stockDataProcessorLambdaPolicy', {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );

    // Every 5 minutes, between 9AM and 4PM EST, Monday through Friday run the stock data processor Lambda
    // TODO something is wrong with this, only ran once
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(stockDataProcessorLambda)],
    });
  }
}
