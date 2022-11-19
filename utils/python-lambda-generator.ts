import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export const pythonLambdaGenerator = (
  thisRef: Construct,
  lambdaName: string
) => {
  const lambdaRole = new iam.Role(thisRef, `${lambdaName}Role`, {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
  });

  const bundling = {};

  const lambdaHandler = new lambda.Function(thisRef, `${lambdaName}Lambda`, {
    runtime: lambda.Runtime.PYTHON_3_9,
    handler: 'index.handler',
    code: lambda.Code.fromAsset(path.join(`./main/api/lambdas/${lambdaName}`), {
      bundling: {
        image: Runtime.PYTHON_3_9.bundlingImage,
        command: [
          'bash',
          '-c',
          'pip3 install -r requirements.txt -t /asset-output && cp -R . /asset-output',
        ],
      },
    }),
    role: lambdaRole,
  });

  // TODO fix permissions
  lambdaRole.attachInlinePolicy(
    new iam.Policy(thisRef, `${lambdaName}LambdaPolicy`, {
      statements: [
        new iam.PolicyStatement({
          // TODO Possibly pass this in as a parameter to the function
          actions: ['*'],
          resources: ['*'],
        }),
      ],
    })
  );

  // returns object type Function for use with APIGW integration
  return lambdaHandler;
};
