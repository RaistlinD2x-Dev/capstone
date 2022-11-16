import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

export class TimestreamStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stockInfoTimeStreamDatabaseName = 'stockInfoDatabase';

    const stockInfoTimeStreamDatabase = new timestream.CfnDatabase(
      this,
      'StockInfoDatabase',
      {
        databaseName: stockInfoTimeStreamDatabaseName,
      }
    );

    const stockInfoTimeStreamTableName = 'stockInfoTable';

    const stockInfoTimeStreamTable = new timestream.CfnTable(
      this,
      'stockInfoTable',
      {
        databaseName: stockInfoTimeStreamDatabase.ref, // ref required to deal with tokenization of name
        tableName: stockInfoTimeStreamTableName,
        retentionProperties: {
          MemoryStoreRetentionPeriodInHours: '336', // 14 days
          MagneticStoreRetentionPeriodInDays: '73000', // 200 years
        },
      }
    );

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

    // Every 5 minutes, between 9AM and 4PM EST, Monday through Friday run the stock data processor Lambda
    const rule = new events.Rule(this, 'Rule', {
      schedule: events.Schedule.cron({
        minute: '5',
        hour: '4-11',
        weekDay: 'MON-FRI',
      }),
      targets: [new targets.LambdaFunction(stockDataProcessorLambda)],
    });

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
  }
}
