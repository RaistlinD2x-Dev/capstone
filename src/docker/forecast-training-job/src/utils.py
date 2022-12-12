import time
import pandas as pd
from calendar import timegm


def convert_to_epoch_time(timestamp):
    utc_time = time.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    ms_time = timegm(utc_time) * 1000

    return str(ms_time)


def get_current_ms_epoch_time():

    millisec = time.time() * 1000
    return str(round(millisec))


def timestream_query_to_dataframe(query_results):

    training_dataset = {"metric_name": [], "timestamp": [], "metric_value": []}
    for result in query_results:
        # timestamp = datetime.strptime(result[1]["ScalarValue"], "%Y-%m-%d %H:%m:%S")
        training_dataset["metric_name"].append(result[0]["ScalarValue"]),
        training_dataset["timestamp"].append(result[1]["ScalarValue"].split(".")[0]),
        training_dataset["metric_value"].append(result[2]["ScalarValue"])

    print(training_dataset)

    df = pd.DataFrame.from_dict(training_dataset)

    return df


def convert_df_to_csv(dataframe, file_name):

    dataframe.to_csv(f"{file_name}", index=False)

    print(f"CSV successfully created with name {file_name}")
