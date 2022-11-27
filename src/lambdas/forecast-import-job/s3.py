import boto3

s3 = boto3.resource("s3")


def upload_csv(client, local_file_name, bucket_name, key):

    client.meta.client.upload_file(local_file_name, bucket_name, key)

    print(f"{local_file_name} uploaded to {bucket_name}/{key}")
