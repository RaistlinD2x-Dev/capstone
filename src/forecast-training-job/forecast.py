import boto3

from utils import *


forecast = boto3.client("forecast")

dataset_group_name = "StocksDatasetGroup"


def create_datasets(
    client,
    dataset_names,
):

    print(dataset_names)

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

    # Deprecated, will create new dataset group for each forecast

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


def create_dataset_group(client, datasets_list):

    dataset_info_list = []
    for dataset_arn in datasets_list:
        identifier = dataset_arn.split("/")[-1]

        response = client.create_dataset_group(
            DatasetGroupName=f"{identifier}", Domain="METRICS"
        )
        dataset_info = {
            "dataset_group_arn": response["DatasetGroupArn"],
            "dataset_arn": dataset_arn,
        }
        dataset_info_list.append(dataset_info)

    return dataset_info_list


def update_dataset_group(client, dataset_info_list):

    for dataset_info in dataset_info_list:

        client.update_dataset_group(
            DatasetGroupArn=dataset_info["dataset_group_arn"],
            DatasetArns=[dataset_info["dataset_arn"]],
        )

    print(
        f"Dataset Group {dataset_info['dataset_group_arn']} updated with dataset list."
    )


def create_dataset_import_jobs(datasets_list, bucket_name, role_arn, dataset_names):

    timestamp = get_current_ms_epoch_time()

    dataset_import_info_list = []

    count = 0
    for dataset in datasets_list:

        dataset_info = {
            "timestamp": timestamp,
            "dataset_arn": dataset,
            "stock_name": dataset_names[count],
            "bucket_name": bucket_name,
            "role_arn": role_arn,
        }
        dataset_import_info_list.append(dataset_info)
        count += 1

    return dataset_import_info_list
