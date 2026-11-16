from peewee import AutoField, IdentityField, PrimaryKeyField, TextField

from app.database import BaseModel
from app.modules.tradeable.enums.tradeable_type import TradableType
from playhouse.shortcuts import model_to_dict

"""
 Tradable is an abtraction over anything that can be trade in the market, can be stocks, futures, commodities
"""


class TradeableModel(BaseModel):
    id = AutoField()
    name = TextField(null=False)
    symbol = TextField(null=False)
    tradable_type = TextField(null=False, default=TradableType.TradableStock)

    def to_dict(self) -> dict:
        return model_to_dict(self)
