import json
import boto3

iam = boto3.client("iam")
role_prefix = "/forecast/"
role_name = "ForecastS3Role"
role_policy_name = "ForecastS3RolePolicy"
role_param_name = "forecast-s3-role"


def forecast_role_exists(client, role_name, role_prefix):

    roles = client.list_roles(PathPrefix=role_prefix)

    if roles == []:
        return False
    else:
        for role in roles["Roles"]:
            if role["RoleName"] == role_name:
                return role["Arn"]
        return False


def create_role(client, role_exists):

    if role_exists == False:

        assume_role_policy_document = {
            "Version": "2012-10-17",
            "Statement": {
                "Effect": "Allow",
                "Principal": {"Service": "forecast.amazonaws.com"},
                "Action": "sts:AssumeRole",
            },
        }

        response = client.create_role(
            Path="/forecast/",
            RoleName=role_name,
            AssumeRolePolicyDocument=json.dumps(assume_role_policy_document),
        )

        return response["Arn"]

    return role_exists


def create_role_policy(client, role_policy_name):

    policies = client.list_policies()

    print(policies)

    if policies != []:
        for policy in policies["Policies"]:
            if policy["PolicyName"] == role_policy_name:
                return policy["Arn"]

    role_policy = {
        # TODO update these permissions
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": ["*"],
                "Resource": ["*"],
            }
        ],
    }

    response = client.create_policy(
        PolicyName=role_policy_name,
        PolicyDocument=json.dumps(role_policy),
        Path="/forecast/",
    )

    return response["Policy"]["Arn"]


def attach_role_policy(client, role_policy_arn, role_name):

    client.attach_role_policy(RoleName=role_name, PolicyArn=role_policy_arn)

    return f"Role Policy with ARN {role_policy_arn} attached to Role {role_name}"
