import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { GetStocks } from './lambdas/get-stocks';
import { GetStocksData } from './lambdas/get-stocks-data';
import { GetStocksWithTicker } from './lambdas/get-stocks-with-ticker';
import { PostStocksData } from './lambdas/post-stocks-data';
import { ForecastTrainingJob } from './lambdas/post-forecast-training-job';
import { PostStocksSelection } from './lambdas/post-stocks-selection';

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

    // define root resource paths
    const stocks = api.root.addResource('stocks');
    const forecasts = api.root.addResource('forecasts');

    // get all stocks on the NASDAQ Exchange
    // TODO think about possibly passing in query param for different exchanges
    const { getStocksLambda } = new GetStocks(this, 'GetStocks');
    const stocksLambdaIntegration = new apigw.LambdaIntegration(getStocksLambda, {
      proxy: true,
    });
    stocks.addMethod('GET', stocksLambdaIntegration);

    // get all stocks on the NASDAQ Exchange
    // TODO think about possibly passing in query param for different exchanges
    const { getStocksWithTickerLambda } = new GetStocksWithTicker(this, 'GetStocksWithTicker');
    const stocksWithTicker = stocks.addResource('{ticker}');
    const stocksWithTickerLambdaIntegration = new apigw.LambdaIntegration(
      getStocksWithTickerLambda,
      {
        proxy: true,
      }
    );
    stocksWithTicker.addMethod('GET', stocksWithTickerLambdaIntegration);

    // get the real time price or a set of historical prices for a given stock
    const { getStocksDataLambda } = new GetStocksData(this, 'GetStocksPrice');
    const stockPrice = stocksWithTicker.addResource('price');
    const stocksPriceLambdaIntegration = new apigw.LambdaIntegration(getStocksDataLambda, {
      proxy: true,
    });
    stockPrice.addMethod('GET', stocksPriceLambdaIntegration);

    // Post stock data to timestream
    const { postStocksDataLambda } = new PostStocksData(this, 'PostStocksPrice');
    const postStocksPriceLambdaIntegration = new apigw.LambdaIntegration(postStocksDataLambda, {
      proxy: true,
    });
    stockPrice.addMethod('POST', postStocksPriceLambdaIntegration);

    // Post stock selections for updating Amazon Timestream of 5 min OHLC bars
    const { postStocksSelectionLambda } = new PostStocksSelection(this, 'PostStocksSelection');
    const postStocksSelectionLambdaIntegration = new apigw.LambdaIntegration(
      postStocksSelectionLambda,
      {
        proxy: true,
      }
    );
    stocks.addMethod('POST', postStocksSelectionLambdaIntegration);

    // kick off training job for a given stock
    const { forecastTrainingJobLambda } = new ForecastTrainingJob(this, 'ForecastTrainingJob');
    const forecastTrainingJobLambdaIntegration = new apigw.LambdaIntegration(
      forecastTrainingJobLambda,
      {
        proxy: true,
      }
    );
    forecasts.addResource('{ticker}').addMethod('POST', forecastTrainingJobLambdaIntegration);

    // storing API URL for use with front end
    new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });
  }
}
