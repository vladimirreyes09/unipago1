from flask import Blueprint, jsonify, request
from peewee import IntegrityError
from pydantic import ValidationError

from app.modules.tradeable.dtos.tradeable_dto import CreateTradeableDto, TradeableDto
from app.modules.tradeable.enums.tradeable_type import TradableType
from app.modules.tradeable.model import TradeableModel

tradeables_blueprint = Blueprint("tradables", __name__, url_prefix="/tradeables")


@tradeables_blueprint.get("/", strict_slashes=False)
def get_tradables():
    tradables = [tradable.to_dict() for tradable in TradeableModel.select()]
    return jsonify(tradables), 200


@tradeables_blueprint.get("/<int:tradable_id>")
def get_tradable(tradable_id: int):
    tradable = TradeableModel.get_or_none(TradeableModel.id == tradable_id)
    if tradable is None:
        return jsonify({"error": "Tradable not found"}), 404
    return jsonify(tradable.to_dict()), 200


@tradeables_blueprint.post("/", strict_slashes=False)
def create_tradable():
    data = request.get_json(silent=True) or {}

    try:
        tradable_input = CreateTradeableDto.validate(data)
        tradable = TradeableModel.create(**tradable_input.dict())

    except (KeyError, IntegrityError) as exc:
        return jsonify({"error": str(exc)}), 400

    except ValidationError as err:
        # TODO: Take this validation message adapter to it's own file on a util folder,
        # did it because vadalition libraries messages are too verbose an can cause vendor lock in
        error_json = {
            "error": {
                "type": "validation",
                "message": "Some fields had a wrong input ",
                "fields": [
                    {"loc": e["loc"][0], "message": e["msg"], "type": e["type"]}
                    for e in err.errors()
                ],
            }
        }

        return jsonify(error_json), 400

    # TODO: Use a centralized logger for unknown or unexpected exceptions so that someone can debug it,
    # but for now and for the sake of simplicity only used a print

    except Exception as e:
        print(e)
        error_json = {"error": {"type": "unknown", "message": "Something went wrong"}}
        return jsonify(error_json), 400

    return jsonify(tradable.to_dict()), 201


@tradeables_blueprint.route("/<int:tradable_id>", methods=["PUT", "PATCH"])
def update_tradable(tradable_id: int):
    tradeable = TradeableModel.get_or_none(TradeableModel.id == tradable_id)

    if tradeable is None:
        return jsonify({"error": "Tradable not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON payload"}), 400

    # Next iteration: validate update payload before saving to the database.
    for field in ("name", "symbol", "tradable_type"):
        if field in data:
            setattr(tradeable, field, data[field])

    try:
        tradeable.save()
    except IntegrityError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify(tradeable.to_dict()), 200


@tradeables_blueprint.delete("/<int:tradable_id>")
def delete_tradable(tradable_id: int):
    tradable = TradeableModel.get_or_none(TradeableModel.id == tradable_id)
    if tradable is None:
        return jsonify({"error": "Tradable not found"}), 404

    tradable.delete_instance()
    return jsonify({"deleted": True, "id": tradable_id}), 204
