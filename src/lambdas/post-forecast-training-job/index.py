def handler(event, context):

    ticker = event["pathParameters"]["ticker"]

    result = {
        "statusCode": 200,
        "body": f"You selected {ticker} for your training job!",
    }

    return result
