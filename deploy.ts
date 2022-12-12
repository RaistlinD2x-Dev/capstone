#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from './main/network/network-stack';
// import { FrontendStack } from './main/ui/frontend-stack';
import { DataStoreStack } from './main/data-store/data-store-stack';
import { DataIngestionStack } from './main/data-ingestion/data-ingestion-stack';
import { AnomalyDetectionStack } from './main/anomaly-detection/anomaly-detection-stack';
import { ApiStack } from './main/api/api-stack';
import { AuthStack } from './main/auth/auth-stack';
import { ForecastStack } from './main/forecast/forecast-stack';

const app = new cdk.App();

const network = new NetworkStack(app, 'NetworkStack');

// const auth = new AuthStack(app, 'AuthStack');

// const frontend = new FrontendStack(app, 'Frontend', {
//   vpc: network.vpc,
// });

const datastore = new DataStoreStack(app, 'Datastore', {});

const dataIngestion = new DataIngestionStack(app, 'DataIngestion', {});

const anomalyDetection = new AnomalyDetectionStack(app, 'AnomalyDetection', {
  vpc: network.vpc,
});

const forecast = new ForecastStack(app, 'Forecast', {
  vpc: network.vpc,
});

const api = new ApiStack(app, 'API');
