import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class DynamodbModelMetadata extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const modelMetaDataTable = new dynamodb.Table(this, 'modelMetaDataTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'dateCreated', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new ssm.StringParameter(this, 'dynamodbModelMetadata', {
      parameterName: 'dynamodb-model-metadata',
      stringValue: modelMetaDataTable.tableName,
    });
  }
}
