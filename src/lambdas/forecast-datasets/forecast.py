import boto3

from utils import *
from ssm import *


forecast = boto3.client("forecast")

dataset_group_name = "StocksDatasetGroup"


def create_datasets(
    client,
    dataset_names,
):

    timestamp = get_current_ms_epoch_time()

    datasets_list = []

    for dataset_name in dataset_names:

        response = client.create_dataset(
            DatasetName=f"{dataset_name}{timestamp}",
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
                print(f"Dataset Group exists: {dataset_group['DatasetGroupArn']}")
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

    iterations = len(datasets_list) // 3

    if len(datasets_list) % 3 != 0:
        iterations += 1

    start = 0
    for i in range(iterations):

        client.update_dataset_group(
            DatasetGroupArn=dataset_group_arn,
            DatasetArns=datasets_list[start : start + 3],
        )

        start += 3

    print(f"Dataset Group {dataset_group_arn} updated with dataset list.")


def create_dataset_import_jobs(datasets_list, bucket_name, role_arn, dataset_names):

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
