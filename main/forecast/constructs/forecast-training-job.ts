import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as path from 'path';

interface ForecastTrainingJobProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ForecastTrainingJob extends Construct {
  constructor(scope: Construct, id: string, props: ForecastTrainingJobProps) {
    super(scope, id);

    const vpc = props!.vpc;

    const cluster = new ecs.Cluster(this, 'Forecast', {
      vpc,
    });

    // iam role for fargate tasks
    const ecsRole = new iam.Role(this, 'ecsRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    // TODO fix permissions
    ecsRole.attachInlinePolicy(
      new iam.Policy(this, 'forecastECSTask', {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );

    // define cpu, ram, and IAM role for use with task
    const taskDefinition = new ecs.TaskDefinition(this, 'ForecastService', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '1024',
      memoryMiB: '2048',
      executionRole: ecsRole,
      taskRole: ecsRole,
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    // defines container to be used from local context
    taskDefinition.addContainer('ForecastTrainingJob', {
      image: new ecs.AssetImage(path.join(__dirname, 'docker')),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'forecast',
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
    new ecs.FargateService(this, 'ForecastService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });
  }
}
