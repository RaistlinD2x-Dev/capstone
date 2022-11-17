import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as path from 'path';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

interface FrontendStackProps extends cdk.StackProps {
  vpc: Vpc;
}

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

    const vpc = props!.vpc;

    const cluster = new ecs.Cluster(this, 'front-end', {
      vpc,
    });

    const ecsRole = new iam.Role(this, 'ecsRole', {
      assumedBy: new iam.ServicePrincipal('ecs.amazonaws.com'),
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

    const taskDefinition = new ecs.TaskDefinition(this, 'FrontendService', {
      compatibility: ecs.Compatibility.FARGATE,
      cpu: '512',
      memoryMiB: '2048',
      executionRole: ecsRole,
      taskRole: ecsRole,
    });

    // const image = new ecs.AssetImage(this, 'BackendImage', {
    //   directory: path.join(__dirname, 'react-app'),
    // });

    // rename this
    const webPage = taskDefinition.addContainer('webpage', {
      image: new ecs.AssetImage(path.join(__dirname, 'docker')),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'webPage',
        mode: ecs.AwsLogDriverMode.NON_BLOCKING,
      }),
    });
    webPage.addPortMappings({
      containerPort: 80,
      protocol: ecs.Protocol.TCP,
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
    });

    const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
      vpc,
      internetFacing: true,
    });
    const listener = lb.addListener('Listener', {
      port: 80,
      open: true,
    });

    service.registerLoadBalancerTargets({
      containerName: webPage.containerName,
      containerPort: webPage.containerPort,
      newTargetGroupId: 'ECS',
      listener: ecs.ListenerConfig.applicationListener(listener, {
        protocol: elbv2.ApplicationProtocol.HTTPS,
      }),
    });
  }
}
