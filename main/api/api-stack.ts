import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { pythonLambdaGenerator } from '../../utils/python-lambda-generator';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    const api = new apigw.RestApi(this, 'capstone-api');

    const stocksLambda = pythonLambdaGenerator(this, 'stocks', `${__dirname}/lambdas/stocks`);

    const stocks = api.root.addResource('stocks');

    stocks.addMethod(
      'GET',
      new apigw.LambdaIntegration(stocksLambda, {
        proxy: true,
      })
    );

    const userPool = new cognito.UserPool(this, 'userpool', {
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        isAdmin: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const domain = userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        // Adds custom prefix to cognito hosted ui endpoint
        domainPrefix: 'capstone-project',
      },
    });

    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...['country', 'city', 'isAdmin']);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...['country', 'city']);

    const userPoolClient = new cognito.UserPoolClient(this, 'userpool-client', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        // cognito.UserPoolClientIdentityProvider.AMAZON,
        // cognito.UserPoolClientIdentityProvider.APPLE,
        // cognito.UserPoolClientIdentityProvider.FACEBOOK,
        // cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        // TODO when login successful redirect to local react server
        callbackUrls: ['http://localhost:3000'],
        flows: {
          // TODO returns access token in URL
          // this is not the most secure method but works for now
          implicitCodeGrant: true,
        },
      },
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    // sets up Cognito as the API Gateway authorizer
    const cognitoAuthorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    cognitoAuthorizer._attachToApi(api);

    // Gets the cognito hosted UI for login endpoint
    const signInUrl = domain.signInUrl(userPoolClient, {
      redirectUri: 'http://localhost:3000', // must be a URL configured under 'callbackUrls' with the client
    });

    // ------- This section is for SSM Parameters to be stored

    // storing API URL for use with front end
    const apiUrlParameter = new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });

    new ssm.StringParameter(this, 'signInUrl', {
      parameterName: 'signInUrl',
      stringValue: signInUrl,
    });

    new cdk.CfnOutput(this, 'signInUrlOutput', {
      value: signInUrl,
    });

    new ssm.StringParameter(this, 'userPoolIdParam', {
      parameterName: 'userPoolId',
      stringValue: userPool.userPoolId,
    });

    new ssm.StringParameter(this, 'userPoolClientIdParam', {
      parameterName: 'userPoolClientId',
      stringValue: userPoolClient.userPoolClientId,
    });

    // --------------- These items are output to ~/cdk-outputs.json

    new cdk.CfnOutput(this, 'userPoolIdOutput', {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'userPoolClientIdOutput', {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, 'userPoolUrlOutput', {
      value: userPool.userPoolProviderUrl,
    });
  }
}
