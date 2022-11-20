import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class AuthStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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
      removalPolicy: cdk.RemovalPolicy.DESTROY,
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
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    new ssm.StringParameter(this, 'userPoolIdParam', {
      parameterName: 'userPoolId',
      stringValue: userPool.userPoolId,
    });

    new ssm.StringParameter(this, 'userPoolClientIdParam', {
      parameterName: 'userPoolClientId',
      stringValue: userPoolClient.userPoolClientId,
    });

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
