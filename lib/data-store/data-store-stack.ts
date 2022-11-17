import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import { CfnTable } from 'aws-cdk-lib/aws-dynamodb';

export class DataStoreStack extends cdk.Stack {
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
  }
}
