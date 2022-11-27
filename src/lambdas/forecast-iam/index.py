from iam import *
from ssm import *


def handler(event, context):

    is_role_present = forecast_role_exists(iam, role_name, role_prefix)

    role_arn = create_role(iam, is_role_present)

    create_ssm_parameter(ssm, data_set_role_param_name, role_arn)

    policy_arn = create_role_policy(iam, role_policy_name)

    attach_role_policy(iam, policy_arn, role_name)
