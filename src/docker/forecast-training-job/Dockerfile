# syntax=docker/dockerfile:1

FROM python:3.9.15

WORKDIR /app

COPY src/requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY src/* .

CMD [ "python3", "index.py"]