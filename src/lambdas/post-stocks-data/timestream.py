import boto3

from utils import *
from constants import *


def write_records_with_common_attributes(stock_data):
    tsw = boto3.client("timestream-write")
    print("Writing records extracting common attributes")

    dimensions = [
        {"Name": "ticker", "Value": stock_data["meta"]["symbol"]},
    ]

    common_attributes = {
        "Dimensions": dimensions,
        "MeasureValueType": "MULTI",
    }

    records = []
    for i in range(0, len(stock_data["values"]), 100):
        record_set = []
        for record in stock_data["values"][i : i + 100]:

            item = {
                "Time": convert_to_epoch_time(record["datetime"]),
                "MeasureName": "Price",
                "MeasureValues": [
                    {
                        "Name": "low",
                        "Value": record["low"],
                        "Type": "DOUBLE",
                    },
                    {
                        "Name": "high",
                        "Value": record["high"],
                        "Type": "DOUBLE",
                    },
                ],
            }

            record_set.append(item)
        records.append(record_set)

    for record in records:
        try:
            result = tsw.write_records(
                DatabaseName=DATABASE_NAME,
                TableName=TABLE_NAME,
                Records=record,
                CommonAttributes=common_attributes,
            )

            # provides wait time between API cycles, sets of 100 are loaded and wait .5 seconds
            time.sleep(0.5)
            print(
                "WriteRecords Status: [%s]"
                % result["ResponseMetadata"]["HTTPStatusCode"]
            )
        except tsw.exceptions.RejectedRecordsException as err:
            print_rejected_records_exceptions(err)
        except Exception as err:
            print("Error:", err)


def print_rejected_records_exceptions(err):
    print("RejectedRecords: ", err)
    for rr in err.response["RejectedRecords"]:
        print("Rejected Index " + str(rr["RecordIndex"]) + ": " + rr["Reason"])
        if "ExistingVersion" in rr:
            print("Rejected record existing version: ", rr["ExistingVersion"])
