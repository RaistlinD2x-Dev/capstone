#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from './main/network/network-stack';
// import { FrontendStack } from './main/ui/frontend-stack';
import { DataStoreStack } from './main/data-store/data-store-stack';
import { DataIngestionStack } from './main/data-ingestion/data-ingestion-stack';
import { MachineLearningStack } from './main/machine-learning/machine-learning-stack';
import { ApiStack } from './main/api/api-stack';
import { AuthStack } from './main/auth/auth-stack';

const app = new cdk.App();

const network = new NetworkStack(app, 'NetworkStack');

// const auth = new AuthStack(app, 'AuthStack');

// const frontend = new FrontendStack(app, 'Frontend', {
//   vpc: network.vpc,
// });

const datastore = new DataStoreStack(app, 'Datastore', {});

const dataIngestion = new DataIngestionStack(app, 'DataIngestion', {});

const machineLearning = new MachineLearningStack(app, 'Forecast', {
  vpc: network.vpc,
});

const api = new ApiStack(app, 'API');
