#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network/network-stack';
import { FrontendStack } from '../lib/ui/frontend-stack';
import { DataStoreStack } from '../lib/data-store/data-store-stack';
import { DataIngestionStack } from '../lib/data-ingestion/data-ingestion-stack';
import { ForecastStack } from '../lib/forecast/forecast-stack';
import { ApiStack } from '../lib/api/api-stack';

const app = new cdk.App();

const network = new NetworkStack(app, 'NetworkStack');

// const frontend = new FrontendStack(app, 'Frontend', {
//   vpc: network.vpc,
// });

const datastore = new DataStoreStack(app, 'Datastore', {});

const dataIngestion = new DataIngestionStack(app, 'DataIngestion', {});

const forecast = new ForecastStack(app, 'Forecast', {
  vpc: network.vpc,
});

const api = new ApiStack(app, 'API', {});
