import time
from calendar import timegm

def convert_to_epoch_time(timestamp):
    utc_time = time.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
    ms_time = timegm(utc_time) * 1000

    return str(ms_time)