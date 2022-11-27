import boto3

from iam import *
from utils import *
from ssm import *


forecast = boto3.client("forecast")


def start_dataset_import_job(dataset_info, file_name):

    forecast = boto3.client("forecast")

    timestamp = dataset_info["timestamp"]
    stock_name = dataset_info["stock_name"]
    dataset_arn = dataset_info["Arn"]
    bucket_name = dataset_info["bucket_name"]
    role_arn = dataset_info["role_arn"]
    s3_path_location = f"s3://{bucket_name}/{stock_name}/{timestamp}/{file_name}"

    response = forecast.create_dataset_import_job(
        DatasetImportJobName=f"DatasetImportJob-{stock_name}-{timestamp}",
        DatasetArn=dataset_arn,
        DataSource={"S3Config": {"Path": s3_path_location, "RoleArn": role_arn}},
    )

    return response["DatasetImportJobArn"]
