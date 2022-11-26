from forecast import *

bucket_param_name = "forecast-bucket-name"
role_param_name = "forecast-s3-role"


def handler(event, context):

    dataset_arn_list = create_datasets(forecast, event)

    exists = dataset_group_exists(forecast, dataset_group_name)

    dataset_group_arn = create_dataset_group(forecast, exists)

    update_dataset_group(forecast, dataset_group_arn, dataset_arn_list)

    bucket_name = get_parameter_value(bucket_param_name)

    role_arn = get_parameter_value(role_param_name)

    dataset_info_list = create_dataset_import_jobs(
        dataset_arn_list, bucket_name, role_arn, event
    )

    return dataset_info_list
