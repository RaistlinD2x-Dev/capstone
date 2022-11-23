import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pythonLambdaGenerator } from '../../../utils/python-lambda-generator';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

interface ApiGatewayProps extends cdk.StackProps {
  userPool: UserPool;
}

export class ApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: ApiGatewayProps) {
    super(scope, id);

    const api = new apigw.RestApi(this, 'capstone-api');

    // sets up Cognito as the API Gateway authorizer
    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [props.userPool],
    });
    cognitoAuthorizer._attachToApi(api);

    const stocksLambda = pythonLambdaGenerator(
      this,
      'stocks',
      `${__dirname}../../../../src/lambdas/stocks`
    );

    const stocks = api.root.addResource('stocks');

    stocks.addMethod(
      'GET',
      new apigw.LambdaIntegration(stocksLambda, {
        proxy: true,
      })
    );

    // storing API URL for use with front end
    new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });
  }
}
