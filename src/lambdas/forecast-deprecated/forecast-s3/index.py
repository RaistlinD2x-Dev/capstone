from s3 import *


def handler(event, context):

    exists = bucket_exists(s3, bucket_name)

    create_bucket(s3, exists)

    create_ssm_parameter(ssm, ssm_param_name, bucket_name)
