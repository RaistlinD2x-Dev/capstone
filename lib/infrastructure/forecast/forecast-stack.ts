import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export class ForecastStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const forecastBucketName = 'swdv-691-final-project-forecast-bucket'

    const bucket = new s3.Bucket(this, forecastBucketName, {
      bucketName: forecastBucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const forecastModelDynamoDbTable = new dynamodb.Table(this, 'ForecastDynamoDbTable', {
      tableName: 'forecast-model-table',
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    })
    
    
  }
}
