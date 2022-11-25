from decimal import Decimal
from ssm import *
from constants import *
from utils import *


def get_stocks(ddb_table):

    response = ddb_table.scan(Select="ALL_ATTRIBUTES")

    return response["Items"]


def update_items(ddb_table, dynamo_table_data, stock_selections):

    # TODO Add in functionality to update intervals
    # for now, 5min intervals need to be hard coded in the request
    # for selection in stock_selections:
    #     is_present = False
    #     for item in dynamo_table_data:
    #         if selection["ticker"] == item["ticker"]:
    #             selection["id"] = item["id"]
    #             ddb_table.put_item(Item=selection)
    #             is_present = True
    #     if is_present == False:
    #         selection["id"] = get_current_ms_epoch_time()
    #         ddb_table.put_item(Item=selection)

    if dynamo_table_data == []:
        for selection in stock_selections:
            print(selection)
            update_item = {
                "id": get_current_ms_epoch_time(),
                "ticker": selection,
                "interval": "5",
            }
            print(update_item)
            ddb_table.put_item(Item=update_item)

    else:
        update_item = {}
        for selection in stock_selections:
            print(selection)
            for data in dynamo_table_data:
                if selection == data["ticker"]:
                    continue
                update_item = {
                    "id": get_current_ms_epoch_time(),
                    "ticker": selection,
                    "interval": 5,
                }
                print(update_item)
