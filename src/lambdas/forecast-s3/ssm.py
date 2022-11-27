import boto3

ssm = boto3.client("ssm")

ssm_param_name = "forecast-bucket-name"


def get_parameter_value(client, param_name):

    response = client.get_parameter(
        Name=param_name,
    )

    return response["Parameter"]["Value"]


def create_ssm_parameter(client, param_name, param_value):

    response = client.put_parameter(
        Name=param_name, Value=param_value, Type="String", Overwrite=True
    )

    print(response)
