#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TimestreamStack } from '../lib/infrastructure/data-ingestion/timestream-stack';
import { ForecastStack } from '../lib/infrastructure/forecast/forecast-stack';

const app = new cdk.App();
new TimestreamStack(app, 'TimestreamStack', {});
new ForecastStack(app, 'ForecastStack', {});
