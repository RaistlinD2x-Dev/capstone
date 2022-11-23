import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { FrontendELB } from './constructs/frontend-elb';
import { FrontendECS } from './constructs/frontend-ecs';

interface FrontendStackProps extends cdk.StackProps {
  vpc: Vpc;
}

export class FrontendStack extends cdk.Stack {
  public readonly ecsRole: Role;
  public readonly taskDefinition: TaskDefinition;

  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

    const frontendECS = new FrontendECS(this, 'FrontendECS');

    const frontendELB = new FrontendELB(this, 'FrontendELB', {
      fargateService: frontendECS.service,
      vpc: props!.vpc,
    });
  }
}
