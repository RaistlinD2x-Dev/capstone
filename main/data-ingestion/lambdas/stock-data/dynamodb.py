import boto3
from ssm import *

from constants import *

def get_stock_selection_data():

    stock_selection_param = STOCK_SELECTION_TABLE_PARAM_NAME
    table_name = get_parameter_value(stock_selection_param)
    
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(table_name)

    response = table.scan()
    data = response['Items']

    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        data.extend(response['Items'])

    print(data)

    return data