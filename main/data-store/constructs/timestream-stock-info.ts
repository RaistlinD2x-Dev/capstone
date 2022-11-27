import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class TimestreamStockInfo extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const stockInfoTimeStreamDatabaseName = 'stockInfoDatabase';

    const stockInfoTimeStreamDatabase = new timestream.CfnDatabase(this, 'StockInfoDatabase', {
      databaseName: stockInfoTimeStreamDatabaseName,
    });

    const stockInfoTimeStreamTableName = 'stockInfoTable';

    const stockInfoTimeStreamTable = new timestream.CfnTable(this, 'stockInfoTable', {
      databaseName: stockInfoTimeStreamDatabase.ref, // ref required to deal with tokenization of name
      tableName: stockInfoTimeStreamTableName,
      retentionProperties: {
        MemoryStoreRetentionPeriodInHours: '8766', // 1 year
        MagneticStoreRetentionPeriodInDays: '73000', // 200 years
      },
    });

    new ssm.StringParameter(this, 'timestreamStockInfoDatabaseName', {
      parameterName: 'timestream-stock-info-database',
      stringValue: stockInfoTimeStreamDatabase.databaseName!,
    });

    new ssm.StringParameter(this, 'timestreamStockInfoTableName', {
      parameterName: 'timestream-stock-info-table',
      stringValue: stockInfoTimeStreamTable.tableName!,
    });
  }
}
