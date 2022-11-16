import requests

def get_stock_data(api_key):
    url = "https://twelve-data1.p.rapidapi.com/time_series"

    querystring = {"symbol":"AMZN","interval":"5min","outputsize":"1","format":"json"} # every 5 minutes, get a 5-min block of data for 1 stock

    headers = {
        "X-RapidAPI-Key": api_key,
        "X-RapidAPI-Host": "twelve-data1.p.rapidapi.com"
    }

    response = requests.request("GET", url, headers=headers, params=querystring)

    return response.json()