import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class ForecastStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'forecastBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const forecastModelDynamoDbTable = new dynamodb.Table(
      this,
      'ForecastModelsDynamoDbTable',
      {
        tableName: 'forecast-model-table',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    const forecastValuesDynamoDbTable = new dynamodb.Table(
      this,
      'ForecastValuesDynamoDbTable',
      {
        tableName: 'forecast-values-table',
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );
  }
}
