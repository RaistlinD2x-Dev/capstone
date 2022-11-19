import boto3

session = boto3.Session()
ssm = session.client ('ssm')

def get_parameter_value(param_name):
    
    response = ssm.get_parameter(
        Name='string',
    )