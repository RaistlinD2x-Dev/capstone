import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { IWTUserPool } from './constructs/IWT-user-pool';
import { IWTUserPoolClient } from './constructs/IWT-user-pool-client';
import { ApiGateway } from './constructs/IWT-api';

interface ApiStackProps extends cdk.StackProps {}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const iwtUserPool = new IWTUserPool(this, 'IWTUserPool');

    const iwtUserPoolClient = new IWTUserPoolClient(this, 'IWTUserPoolClient', {
      userPool: iwtUserPool.userPool,
    });

    const iwtApiGateway = new ApiGateway(this, 'ApiGateway', {
      userPool: iwtUserPool.userPool,
    });
  }
}
