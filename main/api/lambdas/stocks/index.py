from utils import *

database_name = get_environment_variable_value('DB_NAME')
table_name = get_environment_variable_value('TABLE_NAME')


def handler(event, context):

    return event