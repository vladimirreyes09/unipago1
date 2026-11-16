from peewee import SqliteDatabase, Model

db = SqliteDatabase("test.db")


class BaseModel(Model):
    class Meta:
        database = db
