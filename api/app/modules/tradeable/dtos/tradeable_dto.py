from pydantic import BaseModel
from typing import Optional
from app.modules.tradeable.enums.tradeable_type import TradableType


# TODO: When the DTOs get big take them to their own file
class TradeableShared:
    name: str
    symbol: str
    tradable_type: TradableType


class TradeableDto(BaseModel, TradeableShared):
    id: int


class CreateTradeableDto(BaseModel, TradeableShared):
    pass


class UpdateTradeableDto(BaseModel):
    name: Optional[str] = None
    symbol: Optional[str] = None
    tradable_type: Optional[TradableType] = None
