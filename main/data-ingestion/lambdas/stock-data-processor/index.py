from ssm import *
from stock_data import *
from utils import *
from timestream import *
from dynamodb import *

ssm_client = boto3.client('ssm')

def handler(event, context):
  
  stock_getter_api_key = get_parameter_value('twelve-data-api-key')

  stock_selection = get_stock_selection_data()

  stock_data = get_stock_data(stock_getter_api_key, stock_selection)

  write_records_with_common_attributes(stock_data)

  return stock_data



