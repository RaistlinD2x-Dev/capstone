def create_query_string(event_obj):

    interval = event_obj["queryStringParameters"]["interval"]
    numOfInterval = event_obj["queryStringParameters"]["numOfIntervals"]
    ticker = event_obj["pathParameters"]["ticker"]

    url = "https://twelve-data1.p.rapidapi.com/time_series"

    queryString = {
        "symbol": ticker,
        "interval": interval,
        "outputsize": numOfInterval,
        "format": "json",
    }

    return queryString, url
