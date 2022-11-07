#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TimestreamStack } from '../lib/infrastructure/timestream-stack';
import { ForecastStack } from '../lib/infrastructure/forecast/forecast-stack'
import { GrafanaStack } from '../lib/infrastructure/grafana/grafana-stack'

const app = new cdk.App();
new TimestreamStack(app, 'TimestreamStack', {});
new ForecastStack(app, 'ForecastStack', {})
new GrafanaStack(app, 'GrafanaStack', {})