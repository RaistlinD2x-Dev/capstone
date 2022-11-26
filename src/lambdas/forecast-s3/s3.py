import boto3

from sts import *
from ssm import *

s3 = boto3.client("s3")

bucket_name = f"IWT-forecast-bucket-{get_account_number(sts)}"


def bucket_exists(client, bucket_name):

    buckets = client.list_buckets()

    if buckets["Buckets"] == []:
        return False
    else:
        for bucket in buckets["Buckets"]:
            if bucket_name == bucket["Name"]:
                return bucket["Arn"]
            else:
                False


def create_bucket(client, bucket_exists):

    if bucket_exists == False:

        response = client.create_bucket(Bucket=bucket_name)

        print(f"Bucket created: {response['Location']}")

        return bucket_name

    else:

        print(f"Bucket with bucket name {bucket_name} exists!")

        return bucket_name
