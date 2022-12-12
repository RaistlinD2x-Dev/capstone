import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';

interface ForecastTrainingJobProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ForecastTrainingJob extends Construct {
  constructor(scope: Construct, id: string, props: ForecastTrainingJobProps) {
    super(scope, id);

    const vpc = props!.vpc;

    const cluster = new ecs.Cluster(this, 'ForecastJob', {
      vpc,
    });

    // iam role for fargate tasks
    const ecsRole = new iam.Role(this, 'ForecastEcsRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    // TODO fix permissions
    ecsRole.attachInlinePolicy(
      new iam.Policy(this, 'ForecastJobECSTask', {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );

    // define cpu, ram, and IAM role for use with task
    const taskDefinition = new ecs.TaskDefinition(this, 'ForecastJobTask', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '1024',
      memoryMiB: '2048',
      executionRole: ecsRole,
      taskRole: ecsRole,
      networkMode: ecs.NetworkMode.AWS_VPC,
    });

    // defines container to be used from local context
    taskDefinition.addContainer('ForecastJobTrainingJob', {
      image: new ecs.AssetImage(path.join(__dirname, '../../../src/docker/forecast-training-job')),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'ILOVEDICK' }),
      portMappings: [
        {
          containerPort: 80,
          protocol: ecs.Protocol.TCP,
        },
      ],
    });

    new ssm.StringParameter(this, 'ForecastJobTaskDefintionARN', {
      parameterName: 'forecast-task-definition-arn',
      stringValue: taskDefinition.taskDefinitionArn,
    });

    new ssm.StringParameter(this, 'JobTaskRole', {
      parameterName: 'forecast-task-role',
      stringValue: ecsRole.roleArn,
    });

    new ssm.StringParameter(this, 'ForecastJobEcsCluster', {
      parameterName: 'forecast-ecs-cluster',
      stringValue: cluster.clusterArn,
    });

    new ssm.StringParameter(this, 'ForecastJobContainerSubnets', {
      parameterName: 'forecast-container-subnets',
      stringValue: vpc.publicSubnets[0].subnetId,
    });
  }
}
