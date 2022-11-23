import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DynamodbForecastedValues } from './constructs/dynamodb-forecasted-values';
import { DynamodbModelMetadata } from './constructs/dynamodb-model-metadata';
import { DynamodbStockSelection } from './constructs/dynamodb-stock-selection';
import { TimestreamStockInfo } from './constructs/timestream-stock-info';

export class DataStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamodbForecastedValues = new DynamodbForecastedValues(this, 'DynamodbForecastedValues');

    const dyanmodbModelMetadata = new DynamodbModelMetadata(this, 'DyanmodbModelMetadata');

    const dynamodbStockSelection = new DynamodbStockSelection(this, 'DynamodbStockSelection');

    const timestreamStockInfo = new TimestreamStockInfo(this, 'TimestreamStockInfo');
  }
}
