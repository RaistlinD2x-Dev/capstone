import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function } from 'aws-cdk-lib/aws-lambda';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';

interface ForecastStepFunctionProps extends cdk.StackProps {
  forecastIAMLambda: Function;
  forecastS3Lambda: Function;
  forecastDatasetsLambda: Function;
  forecastImportJobLambda: Function;
}

export class ForecastStepFunction extends Construct {
  constructor(scope: Construct, id: string, props: ForecastStepFunctionProps) {
    super(scope, id);

    const forecastIAMInvoke = new tasks.LambdaInvoke(this, 'forecastIAMTask', {
      lambdaFunction: props.forecastIAMLambda,
    });

    const forecastS3Invoke = new tasks.LambdaInvoke(this, 'forecastS3Task', {
      lambdaFunction: props.forecastS3Lambda,
    });

    const forecastDatasetsInvoke = new tasks.LambdaInvoke(this, 'forecastDatasetsTask', {
      lambdaFunction: props.forecastDatasetsLambda,
    });

    const forecastMap = new sfn.Map(this, 'forecastMap');

    const forecastImportJobInvoke = new tasks.LambdaInvoke(this, 'forecastImportJobTask', {
      lambdaFunction: props.forecastImportJobLambda,
    });

    // Step Function to orchestrate the capturing of 1 min of stock data for each stock ticker selected
    // send array of selected stock data to map iterator for lambda processing
    const startState = new sfn.Pass(this, 'startState');
    new sfn.StateMachine(this, 'dataIngestionStepFunction', {
      definition: startState
        .next(forecastIAMInvoke)
        .next(forecastS3Invoke)
        .next(forecastDatasetsInvoke)
        .next(forecastMap.iterator(forecastImportJobInvoke)),
    });
  }
}
