def create_query_string(event_obj):
    if event_obj["queryStringParameters"] == None:

        ticker = event_obj["pathParameters"]["ticker"]
        queryString = {"symbol": ticker, "format": "json", "outputsize": "30"}

        url = "https://twelve-data1.p.rapidapi.com/price"

        return queryString, url

    else:

        interval = event_obj["queryStringParameters"]["interval"]
        numOfInterval = event_obj["queryStringParameters"]["numOfInterval"]
        ticker = event_obj["pathParameters"]["ticker"]

        url = "https://twelve-data1.p.rapidapi.com/time_series"

        queryString = {
            "symbol": ticker,
            "interval": interval,
            "outputsize": numOfInterval,
            "format": "json",
        }

        return queryString, url
