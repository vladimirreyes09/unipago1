from flask import Flask

from app.database import db
from app.modules.tradeable.model import TradeableModel
from app.modules.tradeable.router import tradeables_blueprint

app = Flask(__name__)
app.register_blueprint(tradeables_blueprint)

db.connect(reuse_if_open=True)
db.create_tables([TradeableModel])

print(app.url_map)


@app.route("/")
def hello():
    return "Hello, World!"


@app.before_request
def _db_connect():
    db.connect(reuse_if_open=True)
