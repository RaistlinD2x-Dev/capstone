import boto3

tsq = boto3.client("timestream-query")
timestream_database_param_name = "timestream-stock-info-database"
timestream_table_param_name = "timestream-stock-info-table"


def query_timestream(client, database_name, table_name, stock_name):

    query_string = f'SELECT ticker, time, (high + low)/2 AS avg  FROM "{database_name}"."{table_name}" WHERE ticker = \'{stock_name}\' limit 100'

    response = client.query(
        QueryString=query_string,
    )

    stock_list_of_lists = []
    for item in response["Rows"]:
        stock_list_of_lists.append(item["Data"])

    return stock_list_of_lists
