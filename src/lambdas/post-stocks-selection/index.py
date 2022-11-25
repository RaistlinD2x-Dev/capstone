from constants import *
from ssm import *
from dynamodb import *


def handler(event, context):

    table_name = get_parameter_value(STOCK_SELECTION_DDB_TABLE)

    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table(table_name)

    table_data = get_stocks(table)

    # event['body'] for now will contain an array of strings containing ticker symbols to add
    # TODO update to allow for interval modification later
    update_items(table, table_data, event["body"])

    result = {"statusCode": 200, "body": "Dynamo items updated successfully!"}

    return result
