import boto3

from iam import *
from utils import *
from ssm import *


forecast = boto3.client("forecast")

dataset_group_name = "stocks-dataset-group"


def create_datasets(
    client,
    dataset_names,
):

    timestamp = get_current_ms_epoch_time()

    datasets_list = []

    for dataset_name in dataset_names:

        response = client.create_dataset(
            DatasetName=f"{dataset_name}-{timestamp}",
            Domain="METRICS",
            DataFrequency="5min",
            DatasetType="TARGET_TIME_SERIES",
            Schema={
                "Attributes": [
                    {"AttributeName": "metric_name", "AttributeType": "string"},
                    {"AttributeName": "timestamp", "AttributeType": "timestamp"},
                    {"AttributeName": "metric_value", "AttributeType": "float"},
                ]
            },
        )

        datasets_list.append(response["DatasetArn"])

    return datasets_list


def dataset_group_exists(client, dataset_group_name):

    dataset_groups = client.list_dataset_groups()

    if dataset_groups["DatasetGroups"] == []:
        return False
    else:
        for dataset_group in dataset_groups["DatasetGroups"]:
            if dataset_group["DatasetGroupName"] == dataset_group_name:
                print(f"Dataset Group exists: {dataset_group['Arn']}")
                return dataset_group["DatasetGroupArn"]
            else:
                return False


def create_dataset_group(client, dataset_group_exists):

    if dataset_group_exists == False:

        response = client.create_dataset_group(
            DatasetGroupName=dataset_group_name,
            Domain="METRICS",
        )

        return response["DatasetGroupArn"]

    return dataset_group_exists


def update_dataset_group(client, dataset_group_arn, datasets_list):

    client.update_dataset_group(
        DatasetGroupArn=dataset_group_arn, DatasetArns=datasets_list
    )

    print(f"Dataset Group {dataset_group_arn} updated with dataset list.")


def create_dataset_import_jobs(datasets_list, bucket_name, role_arn, dataset_names):

    # Create list of objects containing timestamp, stock name, bucket, and role_arn
    # Pass list to map iterator to generate datasets and put into bucket partitions
    # Then perform dataset import jobs on each of those locations

    timestamp = get_current_ms_epoch_time()

    dataset_info_list = []

    for dataset in datasets_list:
        dataset_info = {}
        for name in dataset_names:
            dataset_info.update(
                {
                    "timestamp": timestamp,
                    "dataset_arn": dataset,
                    "stock_name": name,
                    "bucket_name": bucket_name,
                    "role_arn": role_arn,
                }
            )
        dataset_info_list.append(dataset_info)

    return dataset_info_list


def start_dataset_import_job(dataset_info):

    forecast = boto3.client("forecast")

    timestamp = dataset_info["timestamp"]
    stock_name = dataset_info["stock_name"]
    dataset_arn = dataset_info["Arn"]
    bucket_name = dataset_info["bucket_name"]
    role_arn = dataset_info["role_arn"]
    s3_path_location = f"s3://{bucket_name}/{stock_name}/{timestamp}"

    response = forecast.create_dataset_import_job(
        DatasetImportJobName=f"DatasetImportJob-{stock_name}-{timestamp}",
        DatasetArn=dataset_arn,
        DataSource={"S3Config": {"Path": s3_path_location, "RoleArn": role_arn}},
    )

    return response["DatasetImportJobArn"]


def main():

    return
