import requests
import json

from constants import *
from ssm import *


def handler(event, context):

    url = API_URL

    API_KEY = get_parameter_value(STOCK_API_PARAM_NAME)

    ticker = event["pathParameters"]["ticker"]

    querystring = {"exchange": "NASDAQ", "symbol": ticker, "format": "json"}

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
    }

    response = requests.request("GET", url, headers=headers, params=querystring)

    jsonResponse = response.json()

    result = {"statusCode": 200, "body": json.dumps(jsonResponse)}

    return result
