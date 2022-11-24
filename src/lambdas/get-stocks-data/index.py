import requests
import json

from constants import *
from ssm import *


from create_query import *


def handler(event, context):

    API_KEY = get_parameter_value(STOCK_API_PARAM_NAME)

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
    }

    querystring, url = create_query_string(event)

    response = requests.request("GET", url, headers=headers, params=querystring)

    jsonResponse = response.json()

    result = {"statusCode": 200, "body": json.dumps(jsonResponse)}

    return result
