import time
from calendar import timegm


def convert_to_epoch_time(timestamp):
    utc_time = time.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    ms_time = timegm(utc_time) * 1000

    return str(ms_time)


def get_current_ms_epoch_time():

    millisec = time.time() * 1000
    return millisec
