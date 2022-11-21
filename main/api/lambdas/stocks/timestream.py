import boto3

session = boto3.Session()
tsq = session.client('timestream-query')


def get_stock_data(stock_ticker, db_name, table_name):

    NextToken = None

    response = tsq.query(
        QueryString=f'SELECT * FROM "{db_name}"."{table_name}" WHERE ticker = \'{stock_ticker}\' ORDER BY time LIMIT 1',
    )

    return response
