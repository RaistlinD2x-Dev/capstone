import boto3

from sts import *
from ssm import *

s3 = boto3.client("s3")

bucket_name = f"iwtforecastbucket{get_account_number(sts)}"


def bucket_exists(client, bucket_name):

    buckets = client.list_buckets()

    print(buckets)

    if buckets["Buckets"] == []:
        return False
    else:
        for bucket in buckets["Buckets"]:
            if bucket_name == bucket["Name"]:
                print(bucket["Arn"])
                return bucket["Arn"]
            else:
                return False


def create_bucket(client, bucket_exists):

    if bucket_exists == False:

        print(bucket_exists)

        response = client.create_bucket(Bucket=bucket_name)

        print(f"Bucket created: {response['Location']}")

        return bucket_name

    else:

        print(f"Bucket with bucket name {bucket_name} exists!")

        return bucket_name


def upload_csv(client, local_file_name, bucket_name, key):

    client.meta.client.upload_file(local_file_name, bucket_name, key)

    print(f"{local_file_name} uploaded to {bucket_name}/{key}")
