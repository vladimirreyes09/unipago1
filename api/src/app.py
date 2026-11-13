from peewee import *

db = SqliteDatabase(":memory")

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello, World!"


# app = Flask(__name__)


# @app.before_request
# def _db_connect():
#     db.connect()
#
#
# @app.teardown_request
# def _db_close(exc):
#     if not db.is_closed():
#         db.close()
