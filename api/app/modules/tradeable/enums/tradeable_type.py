from enum import StrEnum


class TradableType(StrEnum):
    CryptoCurrency = "CryptoCurrency"
    Commodity = "Commodity"
    Future = "Future"
    TradableStock = "TradableStock"
    PublicStock = "PublicStock"
    PrivateStock = "PrivateStock"
