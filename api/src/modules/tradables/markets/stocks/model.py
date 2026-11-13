from peewee import (
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    TextField,
    UUIDField,
)

from api.src.modules.tradables.tradables import TradableStock

"""Trade represent each transaction inside the market"""


class StockMarketTrade(Model):
    trade_id = UUIDField(null=False)
    stock = ForeignKeyField(TradableStock)
    volume = IntegerField(null=False)
