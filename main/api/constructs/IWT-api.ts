import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { GetStocks } from './lambdas/get-stocks';
import { GetStocksPrice } from './lambdas/get-stocks-price';
import { GetStocksWithTicker } from './lambdas/get-stocks-with-ticker';

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

    // get all stocks on the NASDAQ Exchange
    // TODO think about possibly passing in query param for different exchanges
    const { getStocksLambda } = new GetStocks(this, 'GetStocks');

    // assign get-stocks lambda to api resource path /stocks
    const stocks = api.root.addResource('stocks');
    const stocksLambdaIntegration = new apigw.LambdaIntegration(getStocksLambda, {
      proxy: true,
    });
    stocks.addMethod('GET', stocksLambdaIntegration);

    // get all stocks on the NASDAQ Exchange
    // TODO think about possibly passing in query param for different exchanges
    const { getStocksWithTickerLambda } = new GetStocksWithTicker(this, 'GetStocksWithTicker');

    // assign get-stocks lambda to api resource path /stocks
    const stocksWithTicker = stocks.addResource('{ticker}');
    const stocksWithTickerLambdaIntegration = new apigw.LambdaIntegration(
      getStocksWithTickerLambda,
      {
        proxy: true,
      }
    );
    stocksWithTicker.addMethod('GET', stocksWithTickerLambdaIntegration);

    // get real-time stock price, stock ticker received via query params
    const { getStocksPriceLambda } = new GetStocksPrice(this, 'GetStocksPrice');

    // assign get-stocks-price lambda to api resource path /stocks/price
    const stockPrice = stocksWithTicker.addResource('price');
    const stocksPriceLambdaIntegration = new apigw.LambdaIntegration(getStocksPriceLambda, {
      proxy: true,
    });
    stockPrice.addMethod('GET', stocksPriceLambdaIntegration);

    // storing API URL for use with front end
    new ssm.StringParameter(this, 'apiUrlParameter', {
      parameterName: 'api-url',
      stringValue: api.url,
    });
  }
}
