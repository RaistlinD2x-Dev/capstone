from dynamodb import *
from ssm import *
from stock_data import *
from constants import *


def handler(event, context):

    stock_getter_api_key = get_parameter_value(STOCK_API_PARAM_NAME)

    stock_selection = get_stock_selection_data()

    stock_data = get_stock_data(stock_getter_api_key, stock_selection)

    print(stock_data)

    return stock_data
