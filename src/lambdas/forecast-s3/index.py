import boto3

from iam import *

iam = boto3.client("iam")
role_prefix = "/forecast/"
role_name = "ForecastS3Role"
role_policy_name = "ForecastS3RolePolicy"


def handler(event, context):

    is_role_present = forecast_role_exists(iam, role_name, role_prefix)

    role_arn = create_role(iam, is_role_present)

    policy_arn = create_role_policy(iam, role_policy_name)

    attach_role_policy(iam, policy_arn, role_name)
