import boto3

from ssm import *

dynamodb = boto3.resource("dynamodb")
table_param_name = "dynamodb-stock-selection"
table_name = get_parameter_value(ssm, table_param_name)
ddb_table = dynamodb.Table(table_name)


def get_stock_selection_list(table):

    response = table.scan()

    stock_name_list = []
    for stock in response["Items"]:
        stock_name_list.append(stock["ticker"])

    return stock_name_list
