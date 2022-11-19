import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pythonLambdaGenerator } from '../../utils/python-lambda-generator';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const api = new apigateway.RestApi(this, 'capstone-api');

    const apiUrlParameter = new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });

    const helloWorldLambda = pythonLambdaGenerator(this, 'helloworld');

    api.root.addResource('helloworld').addMethod(
      'GET',
      new apigateway.LambdaIntegration(helloWorldLambda, {
        proxy: true,
      })
    );
  }
}
