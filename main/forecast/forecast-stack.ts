import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ForecastTrainingJob } from './constructs/forecast-training-job';
import { ForecastStepFunction } from './constructs/forecast-step-function';
import { ForecastDatasets } from './constructs/lambdas/forecast-datasets';
import { ForecastIAM } from './constructs/lambdas/forecast-iam';
import { ForecastImportJob } from './constructs/lambdas/forecast-import-job';
import { ForecastS3 } from './constructs/lambdas/forecast-s3';

interface ForecastTrainingJobProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ForecastStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ForecastTrainingJobProps) {
    super(scope, id, props);

    new ForecastTrainingJob(this, 'ForecastTrainingJob', {
      vpc: props.vpc,
    });

    // microservice architecture deprecated, using container instead
    // const forecastDatasets = new ForecastDatasets(this, 'ForecastDatasets');

    // const forecastIAM = new ForecastIAM(this, 'ForecastIAM');

    // const forecastS3 = new ForecastS3(this, 'ForecastS3');

    // const forecastImportJob = new ForecastImportJob(this, 'ForecastImportJob');

    // new ForecastStepFunction(this, 'ForecastStepFunction', {
    //   forecastIAMLambda: forecastIAM.forecastIAMLambda,
    //   forecastS3Lambda: forecastS3.forecastS3Lambda,
    //   forecastDatasetsLambda: forecastDatasets.forecastDatasetsLambda,
    //   forecastImportJobLambda: forecastImportJob.forecastImportJobLambda,
    // });
  }
}
