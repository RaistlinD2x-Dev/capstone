import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { Role } from 'aws-cdk-lib/aws-iam';
import { TaskDefinition } from 'aws-cdk-lib/aws-ecs';

interface FrontendStackProps extends cdk.StackProps {
  vpc: Vpc;
}

export class FrontendStack extends cdk.Stack {
  public readonly ecsRole: Role;
  public readonly taskDefinition: TaskDefinition;

  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

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
      image: new ecs.AssetImage(path.join(__dirname, 'docker')),
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
    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });

    // Create an internet-available load balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true,
    });

    // sets up LB SG to open port 80
    const listener = lb.addListener('Listener', {
      port: 80,
    });

    // set target of port 80 received data to the fargate service
    listener.addTargets('ApplicationFleet', {
      port: 80,
      targets: [service],
    });
  }
}
