from iam import *
from ssm import *
from s3 import *
from dynamodb import *
from forecast import *
from timestream import *


def main():

    is_role_present = forecast_role_exists(iam, role_name, role_prefix)

    role_arn = create_role(iam, is_role_present)

    create_ssm_parameter(ssm, data_set_role_param_name, role_arn)

    policy_arn = create_role_policy(iam, role_policy_name)

    attach_role_policy(iam, policy_arn, role_name)

    exists = bucket_exists(s3, bucket_name)

    create_bucket(s3, exists)

    create_ssm_parameter(ssm, bucket_param_name, bucket_name)

    stock_list = get_stock_selection_list(ddb_table)

    dataset_arn_list = create_datasets(forecast, stock_list)

    dataset_info_list = create_dataset_group(forecast, dataset_arn_list)

    update_dataset_group(forecast, dataset_info_list)

    bucket_name = get_parameter_value(ssm, bucket_param_name)

    role_arn = get_parameter_value(ssm, role_param_name)

    dataset_import_info_list = create_dataset_import_jobs(
        dataset_arn_list, bucket_name, role_arn, stock_list
    )

    # TODO the rest of this neeeds to be modified to fit the container model instead of lambdas

    database_name = get_parameter_value(ssm, timestream_database_param_name)

    table_name = get_parameter_value(ssm, timestream_table_param_name)

    for dataset_import in dataset_import_info_list:
        stock_data_list = query_timestream(
            tsq, database_name, table_name, dataset_import["stock_name"]
        )

        df = timestream_query_to_dataframe(stock_data_list)

        filename = f"{dataset_import['stock_name']}{dataset_import['timestamp']}.csv"
        convert_df_to_csv(df, filename)

        key = f"{dataset_import['stock_name']}/{dataset_import['timestamp']}/{dataset_import['stock_name']}{dataset_import['timestamp']}.csv".lower()
        bucket_name = dataset_import["bucket_name"]

        upload_csv(s3, f"/tmp/{filename}", bucket_name, key)

        start_dataset_import_job(forecast, dataset_import, filename)
