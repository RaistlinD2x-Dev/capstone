import boto3
import pandas as pd
import time
from calendar import timegm

from iam import *


forecast = boto3.client("forecast")


def get_parameter_value(param_name):
    ssm_client = boto3.client("ssm")

    response = ssm_client.get_parameter(
        Name=param_name,
    )

    return response["Parameter"]["Value"]


def create_ssm_parameter(param_name, param_value):
    ssm_client = boto3.client("ssm")

    response = ssm_client.put_parameter(
        Name=param_name, Value=param_value, Type="String"
    )

    print(response)


def create_dataset_group(param_name, dataset_group_name, dataset_arn):

    forecast = boto3.client("forecast")

    response = forecast.create_dataset_group(
        DatasetGroupName=dataset_group_name, Domain="METRICS", DatasetArns=[dataset_arn]
    )

    create_ssm_parameter(f"datasetgroup-{param_name}", response["DatasetGroupArn"])

    return response["DatasetGroupArn"]


def create_dataset(
    dataset_name,
):

    forecast = boto3.client("forecast")

    response = forecast.create_dataset(
        DatasetName=dataset_name,
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

    return response["DatasetArn"]


def convert_to_epoch_time(timestamp):
    utc_time = time.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    ms_time = timegm(utc_time) * 1000

    return str(ms_time)


def get_current_ms_epoch_time():

    millisec = time.time() * 1000
    return str(round(millisec))


def create_dataset_import_job(client, dataset_arn, get_or_create_bucket_fn, role_arn):

    timestamp = get_current_ms_epoch_time()

    response = client.create_dataset_import_job(
        DatasetImportJobName=f"DatasetImportJob-{timestamp}",
        DatasetArn=dataset_arn,
        DataSource={
            "S3Config": {
                "Path": get_or_create_bucket_fn(),
                "RoleArn": role_arn,
            }
        },
    )

    return response["DatasetImportJobArn"]


def main():

    dataset_arn = create_dataset("testDataset")

    create_dataset_group("datasetgroup-GOOG", "testDatasetGroup", dataset_arn)

    is_role_present = forecast_role_exists(iam, role_name, role_prefix)

    role_arn = create_role(iam, is_role_present)

    policy_arn = create_role_policy(iam, role_policy_name)

    attach_role_policy(iam, policy_arn, role_name)

    create_dataset_import_job(forecast, dataset_arn, get_or_create_bucket, role_arn)
