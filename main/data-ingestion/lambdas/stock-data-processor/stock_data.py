import requests

def get_stock_data(api_key, stock_selection):
    url = "https://twelve-data1.p.rapidapi.com/time_series"

    selection_array = []
    for selection in stock_selection:

        querystring = {f"symbol":"{selection.ticker}","interval":"{selection.interval}","outputsize":"1","format":"json"} # every 1 minutes, get a 1-min block of data for 1 stock

        headers = {
            "X-RapidAPI-Key": api_key,
            "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com"
        }

        response = requests.request("GET", url, headers=headers, params=querystring)

        selection_array.append(response.json())

    return selection_array