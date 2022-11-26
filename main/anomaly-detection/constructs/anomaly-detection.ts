import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Function } from 'aws-cdk-lib/aws-lambda';

export interface AnomalyDetectionTrainingJobProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

// TODO Probably need to break this stack apart some more
export class AnomalyDetectionTrainingJob extends Construct {
  public readonly anomalyDetectionTrainingJobLambda: Function;
  constructor(scope: Construct, id: string, props?: AnomalyDetectionTrainingJobProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, 'front-end', {
      vpc: props!.vpc,
    });

    // iam role for fargate tasks
    const anomalyDetectionTrainingJobTrainingJobRole = new iam.Role(
      this,
      'anomalyDetectionTrainingJobTrainingJobRole',
      {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      }
    );
    // TODO fix permissions
    anomalyDetectionTrainingJobTrainingJobRole.attachInlinePolicy(
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
    const anomalyDetectionTrainingJobTrainingJobTaskDefinition = new ecs.TaskDefinition(
      this,
      'anomalyDetectionTrainingJobTrainingJobTaskDefinition',
      {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: '512',
        memoryMiB: '1024',
        executionRole: anomalyDetectionTrainingJobTrainingJobRole,
        taskRole: anomalyDetectionTrainingJobTrainingJobRole,
        // networkMode: ecs.NetworkMode.AWS_VPC,
      }
    );

    // defines container to be used from local context
    const anomalyDetectionTrainingJobTrainingJob =
      anomalyDetectionTrainingJobTrainingJobTaskDefinition.addContainer(
        'anomalyDetectionTrainingJobTrainingJob',
        {
          image: new ecs.AssetImage(path.join(__dirname, '../docker')),
          logging: new ecs.AwsLogDriver({
            streamPrefix: 'anomalyDetectionTrainingJobTrainingJob',
            mode: ecs.AwsLogDriverMode.NON_BLOCKING,
          }),
        }
      );
  }
}
