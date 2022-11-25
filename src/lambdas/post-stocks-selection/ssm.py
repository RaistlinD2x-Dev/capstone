import boto3


def get_parameter_value(param_name):
    ssm_client = boto3.client("ssm")

    response = ssm_client.get_parameter(
        Name=param_name,
    )

    return response["Parameter"]["Value"]
