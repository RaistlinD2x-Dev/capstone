import requests
import json

from constants import *
from ssm import *


def handler(event,context):

    url = API_URL

    API_KEY = get_parameter_value(STOCK_API_PARAM_NAME)

    querystring = {"exchange":"NASDAQ","format":"json"}

    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com"
    }

    response = requests.request("GET", url, headers=headers, params=querystring)

    return response.json()