import boto3
from ssm import *


session = boto3.Session()
ddb = session.client('dynamodb')


def get_stock_selection_data():

    param_name = 'stock-selection'
    table_name = get_parameter_value(param_name)

    response = ddb.query(
        TableName=table_name,
        Select='ALL_ATTRIBUTES'
    )

    print(response)

    return response