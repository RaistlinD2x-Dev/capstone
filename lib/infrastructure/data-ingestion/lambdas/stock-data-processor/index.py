from ssm import *
from stock_data import *
from utils import *
from timestream import *

ssm_client = boto3.client('ssm')

def handler():
  
  stock_getter_api_key = get_parameter_value('twelve-data-api-key')

  stock_data = get_stock_data(stock_getter_api_key)

  write_records_with_common_attributes(stock_data)

  return stock_data



