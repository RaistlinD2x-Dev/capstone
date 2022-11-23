import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class DynamodbStockSelection extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const stockSelectionDynamoDbTable = new dynamodb.Table(this, 'StockSelectionDynamoDbTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new ssm.StringParameter(this, 'stockSelectionParameter', {
      parameterName: 'dynamodb-stock-selection',
      stringValue: stockSelectionDynamoDbTable.tableName,
    });
  }
}
