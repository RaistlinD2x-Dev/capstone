from forecast import *
from timestream import *
from ssm import *

bucket_param_name = "forecast-bucket-name"
role_param_name = "forecast-s3-role"
timestream_database_param_name = "timestream-stock-info-database"
timestream_table_param_name = "timestream-stock-info-table"


def handler(event, context):

    database_name = get_parameter_value(timestream_database_param_name)

    table_name = get_parameter_value(timestream_table_param_name)

    stock_data_list = query_timestream(
        tsq, database_name, table_name, event["stock_name"]
    )

    df = timestream_query_to_dataframe(stock_data_list)

    filename = f"{event['stock_name']}-{event['timestamp']}.csv"
    convert_df_to_csv(df, filename)

    start_dataset_import_job(event, filename)
