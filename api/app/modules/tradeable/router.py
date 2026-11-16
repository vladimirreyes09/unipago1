from flask import Blueprint, json, jsonify, request
from peewee import IntegrityError, Update
from playhouse.shortcuts import model_to_dict
from pydantic import ValidationError, TypeAdapter
from app.modules.tradeable.dtos.tradeable_dto import (
    CreateTradeableDto,
    TradeableDto,
    UpdateTradeableDto,
)
from app.modules.tradeable.enums.tradeable_type import TradableType
from app.modules.tradeable.model import TradeableModel, TradeableStatus
from http import HTTPStatus

tradeables_blueprint = Blueprint("tradables", __name__, url_prefix="/tradeables")

LIMIT_PER_PAGE = 20


@tradeables_blueprint.get("/", strict_slashes=False)
def get_tradables():

    page = request.args.get("page", default=1, type=int)

    offset = (page - 1) * LIMIT_PER_PAGE

    tradeables = [
        tradeable.to_dict()
        for tradeable in TradeableModel.select()
        .where(TradeableModel.status == TradeableStatus.ACTIVE)
        .limit(LIMIT_PER_PAGE)
        .offset(offset)
    ]

    count = (
        TradeableModel.select()
        .where(TradeableModel.status == TradeableStatus.ACTIVE)
        .count()
    )

    validated_tradeables = TypeAdapter(list[TradeableDto]).dump_python(
        tradeables, mode="json"
    )

    return jsonify({"count": count, "elements": validated_tradeables}), HTTPStatus.OK


@tradeables_blueprint.get("/<int:tradable_id>")
def get_tradable(tradable_id: int):
    tradable = TradeableModel.get_or_none(TradeableModel.id == tradable_id)
    if tradable is None:
        return jsonify({"error": "Tradable not found"}), HTTPStatus.NOT_FOUND
    return jsonify(tradable.to_dict()), HTTPStatus.OK


@tradeables_blueprint.post("/", strict_slashes=False)
def create_tradable():
    data = request.get_json(silent=True) or {}
    print(data)
    try:
        tradable_input = CreateTradeableDto.validate(data)
        tradable = TradeableModel.create(**tradable_input.dict())

    except (KeyError, IntegrityError) as exc:
        return jsonify({"error": str(exc)}), HTTPStatus.BAD_REQUEST

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

        return jsonify(error_json), HTTPStatus.BAD_REQUEST
    # TODO: Use a centralized logger for unknown or unexpected exceptions so that someone can debug it,
    # but for now and for the sake of simplicity only used a print

    except Exception as e:
        print(e)
        error_json = {"error": {"type": "unknown", "message": "Something went wrong"}}
        return jsonify(error_json), HTTPStatus.INTERNAL_SERVER_ERROR

    return jsonify(tradable.to_dict()), HTTPStatus.CREATED


@tradeables_blueprint.route("/<int:tradable_id>", methods=["PUT", "PATCH"])
def update_tradable(tradable_id: int):
    tradeable = TradeableModel.get_or_none(
        (TradeableModel.id == tradable_id)
        & (TradeableModel.status == TradeableStatus.ACTIVE)
    )

    if tradeable is None:
        return jsonify({"error": "Tradable not found"}), HTTPStatus.NOT_FOUND

    # Next iteration: validate update payload before saving to the database.
    try:
        data = request.get_json(silent=True) or {}
        modified_fields = UpdateTradeableDto.validate(data).dict(exclude_none=True)

        modified_rows = (
            TradeableModel.update(**modified_fields)
            .where(
                (TradeableModel.id == tradeable.id)
                & (TradeableModel.status == TradeableStatus.ACTIVE)
            )
            .execute()
        )

        if modified_rows == 0:
            return jsonify(
                {"error": "Unable to execute update"}
            ), HTTPStatus.BAD_REQUEST

        updated = {**tradeable.to_dict(), **modified_fields}

        return TradeableDto(**updated).model_dump_json()

    except IntegrityError as exc:
        return jsonify({"error": str(exc)}), HTTPStatus.BAD_REQUEST

    except ValidationError as err:
        error_json = {
            "error": {
                "type": "validation",
                "message": "Some fields had a wrong input ",
                "fields": [
                    {"loc": e["loc"], "message": e["msg"], "type": e["type"]}
                    for e in err.errors()
                ],
            }
        }

        return jsonify(error_json), HTTPStatus.BAD_REQUEST

    return jsonify(tradeable.to_dict()), HTTPStatus.OK


@tradeables_blueprint.delete("/<int:tradable_id>")
def delete_tradable(tradable_id: int):
    tradable = TradeableModel.get_or_none(TradeableModel.id == tradable_id)
    if tradable is None:
        return jsonify({"error": "Tradable not found"}), HTTPStatus.NOT_FOUND

    tradable.delete_instance()
    return jsonify({"deleted": True, "id": tradable_id}), HTTPStatus.NO_CONTENT
