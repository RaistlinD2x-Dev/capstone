import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AnomalyDetectionTrainingJob } from './constructs/anomaly-detection';

interface AnomalyDetectionStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class AnomalyDetectionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AnomalyDetectionStackProps) {
    super(scope, id, props);

    const anomalyDetection = new AnomalyDetectionTrainingJob(this, 'AnomalyDetection', {
      vpc: props.vpc,
    });

    // see notes in Forecast construct
    // const forecast = new Forecast(this, 'Forecast');
  }
}
