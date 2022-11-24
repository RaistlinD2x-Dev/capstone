import requests

from constants import *
from ssm import *
from create_query import *
from timestream import *


def handler(event, context):

    print(event)

    API_KEY = get_parameter_value(STOCK_API_PARAM_NAME)

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com",
    }

    querystring, url = create_query_string(event)

    response = requests.request("GET", url, headers=headers, params=querystring)

    print(response)
    print(response.json())

    write_records_with_common_attributes(response.json())

    result = {"statusCode": 200, "body": "Records written successfully!"}

    return result
