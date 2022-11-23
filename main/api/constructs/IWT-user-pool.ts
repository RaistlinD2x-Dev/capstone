import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { UserPool } from 'aws-cdk-lib/aws-cognito';

export class IWTUserPool extends Construct {
  public readonly userPool: UserPool;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(this, 'userpool', {
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

    new cdk.CfnOutput(this, 'userPoolIdOutput', {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, 'userPoolUrlOutput', {
      value: this.userPool.userPoolProviderUrl,
    });

    new ssm.StringParameter(this, 'userPoolIdParam', {
      parameterName: 'userPoolId',
      stringValue: this.userPool.userPoolId,
    });
  }
}
