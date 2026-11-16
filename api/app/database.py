import os
from peewee import SqliteDatabase, Model

db = SqliteDatabase(os.getenv("DATABASE_PATH", "test.db"))


class BaseModel(Model):
    class Meta:
        database = db
