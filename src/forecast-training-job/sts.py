import boto3

sts = boto3.client("sts")


def get_account_number(client):

    response = client.get_caller_identity()

    return response["Account"]
