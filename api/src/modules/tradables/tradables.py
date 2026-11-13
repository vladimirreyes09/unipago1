from peewee import Check, FloatField, Model, TextField

"""
 Tradable is an abtraction over anything that can be trade in the market, can be stocks, futures, commodities
"""


class TradableModal(Model):
    name = TextField(null=False)
    symbol = TextField(null=False)
    # Probably a constantly changing value that should not be updated on each trade
    price = FloatField(null=False, constraints=[Check("price > 0")])


# Message for the reviweer: Each of this can be in their own model if necessary but for simplicity I'm going to leave it as it is
# on the other hand there are differences between each tradable, but right know I cannot recall
class Future(TradableModal):
    pass


class TradableStock(TradableModal):
    pass


class PublicStock(TradableModal):
    pass


class PrivateStock(TradableModal):
    pass
