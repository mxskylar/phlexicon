FROM python:3-alpine

WORKDIR /db
COPY ./db /db
COPY ./requirements.txt /db
RUN pip install -r requirements.txt