import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as timestream from 'aws-cdk-lib/aws-timestream';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class DataStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const stockInfoTimeStreamDatabaseName = 'stockInfoDatabase';

    const stockInfoTimeStreamDatabase = new timestream.CfnDatabase(this, 'StockInfoDatabase', {
      databaseName: stockInfoTimeStreamDatabaseName,
    });

    const stockInfoTimeStreamTableName = 'stockInfoTable';

    const stockInfoTimeStreamTable = new timestream.CfnTable(this, 'stockInfoTable', {
      databaseName: stockInfoTimeStreamDatabase.ref, // ref required to deal with tokenization of name
      tableName: stockInfoTimeStreamTableName,
      retentionProperties: {
        MemoryStoreRetentionPeriodInHours: '336', // 14 days
        MagneticStoreRetentionPeriodInDays: '73000', // 200 years
      },
    });

    const modelMetaDataTable = new dynamodb.Table(this, 'modelMetaDataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'dateCreated', type: dynamodb.AttributeType.STRING },
    });

    const forecastedValuesTable = new dynamodb.Table(this, 'forecastedValuesTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
    });

    // Choose up to 8 stocks and the interval of stock data to be received
    const stockSelectionDynamoDbTable = new dynamodb.Table(this, 'StockSelectionDynamoDbTable', {
      tableName: 'stock-selection-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new ssm.StringParameter(this, 'stockSelectionParameter', {
      parameterName: 'stock-selection',
      stringValue: stockSelectionDynamoDbTable.tableName,
    });
  }
}
