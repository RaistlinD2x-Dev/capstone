import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

interface IWTUserPoolClientProps extends cdk.StackProps {
  userPool: UserPool;
}

export class IWTUserPoolClient extends Construct {
  constructor(scope: Construct, id: string, props: IWTUserPoolClientProps) {
    super(scope, id);

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

    const userPool = props.userPool;

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

    const domain = props.userPool.addDomain('CognitoDomain', {
      cognitoDomain: {
        // Adds custom prefix to cognito hosted ui endpoint
        domainPrefix: 'capstone-project',
      },
    });

    // Gets the cognito hosted UI for login endpoint
    const signInUrl = domain.signInUrl(userPoolClient, {
      redirectUri: 'http://localhost:3000', // must be a URL configured under 'callbackUrls' with the client
    });

    new ssm.StringParameter(this, 'signInUrl', {
      parameterName: 'sign-in-url',
      stringValue: signInUrl,
    });

    new cdk.CfnOutput(this, 'signInUrlOutput', {
      value: signInUrl,
    });

    new cdk.CfnOutput(this, 'userPoolClientIdOutput', {
      value: userPoolClient.userPoolClientId,
    });

    new ssm.StringParameter(this, 'userPoolClientIdParam', {
      parameterName: 'user-pool-client-id',
      stringValue: userPoolClient.userPoolClientId,
    });
  }
}
