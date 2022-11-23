import * as cdk from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { FargateService } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as path from 'path';

interface FrontendECSProps extends cdk.StackProps {
  vpc: Vpc;
}

export class FrontendECS extends Construct {
  public readonly service: FargateService;
  constructor(scope: Construct, id: string, props?: FrontendECSProps) {
    super(scope, id);

    const vpc = props!.vpc;

    const cluster = new ecs.Cluster(this, 'front-end', {
      vpc,
    });

    // iam role for fargate tasks
    const ecsRole = new iam.Role(this, 'ecsRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    // TODO fix permissions
    ecsRole.attachInlinePolicy(
      new iam.Policy(this, 'ecsTask', {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );

    // define cpu, ram, and IAM role for use with task
    const taskDefinition = new ecs.TaskDefinition(this, 'FrontendService', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '512',
      memoryMiB: '1024',
      executionRole: ecsRole,
      taskRole: ecsRole,
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    // defines container to be used from local context
    const webPage = taskDefinition.addContainer('webpage', {
      image: new ecs.AssetImage(path.join(__dirname, '../../../src/docker/react')),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'webPage',
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
      }),
      portMappings: [
        {
          containerPort: 80,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    // create a fargate service to managing fagate tasks
    this.service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });
  }
}
