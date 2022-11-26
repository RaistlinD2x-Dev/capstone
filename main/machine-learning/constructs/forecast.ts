import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as forecast from 'aws-cdk-lib/aws-forecast';

export class Forecast extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // Domain Schema not explained. Attributes defined but not how to shape teh object for definition.
    // Will handle forecast creation via Boto3 until the APIs for CDK are improved.

    // // METRICS DOMAIN SCHEMA?
    // const metricsSchema = {
    //     metric_name: '',
    //     "timestamp" Date,
    //     "metric_value": Float64
    // }

    // const datasetProps = {
    //   datasetName: 'testDataSet',
    //   datasetType: 'stockName',
    //   domain: 'METRICS',
    //   schema: metricsSchema,
    //   dataFrequency: '5min',
    // };

    // const cfnDataset = new forecast.CfnDataset(this, 'testDataSet', datasetProps);

    // const datasetGroupProps = {
    //   datasetGroupName: 'testDataSetGroup',
    //   domain: 'METRICS',
    //   datasetArns: [cfnDataset.attrArn],
    // };

    // const cfnDatasetGroup = new forecast.CfnDatasetGroup(
    //   this,
    //   'testDataSetGroup',
    //   datasetGroupProps
    // );
  }
}
