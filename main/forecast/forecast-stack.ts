import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
// import { ecsRole } from '../ui/frontend-stack';

// Pull or don't pull from the front-end? Creates dependancy, dunno if I like that
// export interface ForecastStackProps extends cdk.StackProps {
//   ecsRole: Role;
//   taskDefinition: TaskDefinition;
// }

export interface ForecastStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
}

export class ForecastStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: ForecastStackProps) {
    super(scope, id, props);

    const cluster = new ecs.Cluster(this, 'front-end', {
      vpc: props!.vpc,
    });

    // iam role for fargate tasks
    const sagemakerTrainingJobRole = new iam.Role(
      this,
      'sagemakerTrainingJobRole',
      {
        assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      }
    );
    // TODO fix permissions
    sagemakerTrainingJobRole.attachInlinePolicy(
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
    const sagemakerTrainingJobTaskDefinition = new ecs.TaskDefinition(
      this,
      'sagemakerTrainingJobTaskDefinition',
      {
        compatibility: ecs.Compatibility.FARGATE,
        cpu: '512',
        memoryMiB: '1024',
        executionRole: sagemakerTrainingJobRole,
        taskRole: sagemakerTrainingJobRole,
        // networkMode: ecs.NetworkMode.AWS_VPC,
      }
    );

    // defines container to be used from local context
    const sagemakerTrainingJob =
      sagemakerTrainingJobTaskDefinition.addContainer('sagemakerTrainingJob', {
        image: new ecs.AssetImage(path.join(__dirname, 'docker')),
        logging: new ecs.AwsLogDriver({
          streamPrefix: 'sagemakerTrainingJob',
          mode: ecs.AwsLogDriverMode.NON_BLOCKING,
        }),
      });
  }
}
