import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'capstone-api');

    const apiUrlParameter = new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });

    const lambdaRole = new iam.Role(this, 'helloWorldRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'for helloworld',
    });

    const helloWorldLambda = new lambda.Function(this, 'helloWorldLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambdas/helloworld')),
      role: lambdaRole,
    });

    // TODO fix permissions
    lambdaRole.attachInlinePolicy(
      new iam.Policy(this, 'helloWorldLambdaPolicy', {
        statements: [
          new iam.PolicyStatement({
            actions: ['*'],
            resources: ['*'],
          }),
        ],
      })
    );

    api.root
      .addResource('helloworld')
      .addMethod(
        'GET',
        new apigateway.LambdaIntegration(helloWorldLambda, { proxy: true })
      );
  }
}
