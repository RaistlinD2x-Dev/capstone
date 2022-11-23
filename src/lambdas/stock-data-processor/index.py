
from utils import *
from timestream import *

ssm_client = boto3.client('ssm')

def handler(event, context):
  
  write_records_with_common_attributes(event)

  return



