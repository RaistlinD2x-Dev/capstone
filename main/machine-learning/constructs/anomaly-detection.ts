import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface AnomalyDetectionStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class AnomalyDetection extends Construct {
  public readonly anomalyDetectionLambda: Function;
  constructor(scope: Construct, id: string, props?: AnomalyDetectionStackProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, 'front-end', {
      vpc: props!.vpc,
    });

    // iam role for fargate tasks
    const anomalyDetectionTrainingJobRole = new iam.Role(this, 'anomalyDetectionTrainingJobRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });
    // TODO fix permissions
    anomalyDetectionTrainingJobRole.attachInlinePolicy(
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
    const anomalyDetectionTrainingJobTaskDefinition = new ecs.TaskDefinition(
      this,
      'anomalyDetectionTrainingJobTaskDefinition',
      {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: '512',
        memoryMiB: '1024',
        executionRole: anomalyDetectionTrainingJobRole,
        taskRole: anomalyDetectionTrainingJobRole,
        // networkMode: ecs.NetworkMode.AWS_VPC,
      }
    );

    // defines container to be used from local context
    const anomalyDetectionTrainingJob = anomalyDetectionTrainingJobTaskDefinition.addContainer(
      'anomalyDetectionTrainingJob',
      {
        image: new ecs.AssetImage(path.join(__dirname, '../docker')),
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'anomalyDetectionTrainingJob',
          mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        }),
      }
    );
  }
}
