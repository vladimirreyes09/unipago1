class InvalidTradeException(Exception):
    def __init__(self, message: str, symbol: str = "", order_id: str = ""):
        self.symbol = symbol
        self.order_id = order_id
        super().__init__(message)


class NotAuthorizaedTrade(InvalidTradeException):
    pass


class ClosedeMarketExection(Exception):
    pass


class UnsuffientFounds(Exception):
    pass
