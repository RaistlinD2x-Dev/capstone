import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { FargateService } from 'aws-cdk-lib/aws-ecs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';

interface FrontendELBProps extends cdk.StackProps {
  fargateService: FargateService;
  vpc: Vpc;
}

export class FrontendELB extends Construct {
  constructor(scope: Construct, id: string, props: FrontendELBProps) {
    super(scope, id);

    const vpc = props.vpc;

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
      targets: [props.fargateService],
    });
  }
}
