from forecast import *
from dynamodb import *
from ssm import *

bucket_param_name = "forecast-bucket-name"
role_param_name = "forecast-s3-role"


def handler(event, context):

    stock_list = get_stock_selection_list(ddb_table)

    dataset_arn_list = create_datasets(forecast, stock_list)

    dataset_info_list = create_dataset_group(forecast, dataset_arn_list)

    update_dataset_group(forecast, dataset_info_list)

    bucket_name = get_parameter_value(ssm, bucket_param_name)

    role_arn = get_parameter_value(ssm, role_param_name)

    dataset_import_info_list = create_dataset_import_jobs(
        dataset_arn_list, bucket_name, role_arn, stock_list
    )

    return dataset_import_info_list
