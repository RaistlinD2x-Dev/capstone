import boto3

ssm = boto3.client("ssm")


data_set_role_param_name = "forecast-s3-role"


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
