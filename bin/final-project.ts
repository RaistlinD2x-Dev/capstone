#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network/network-stack';
import { FrontendStack } from '../lib/ui/frontend-stack';

const app = new cdk.App();

const network = new NetworkStack(app, 'NetworkStack');

const frontend = new FrontendStack(app, 'Frontend', {
  vpc: network.vpc,
});
