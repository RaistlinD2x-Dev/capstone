import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { AnomalyDetection } from './constructs/anomaly-detection';
import { Forecast } from './constructs/forecast';

interface MachineLearningStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class MachineLearningStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MachineLearningStackProps) {
    super(scope, id, props);

    const anomalyDetection = new AnomalyDetection(this, 'AnomalyDetection', {
      vpc: props.vpc,
    });

    // see notes in Forecast construct
    // const forecast = new Forecast(this, 'Forecast');
  }
}
