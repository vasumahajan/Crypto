require("dotenv").config();

//Express
const express = require("express");
const app = express();

//Handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

//Handle JSON
app.use(express.json());

//Cookie Parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use("/", (req, res) => {
	res.json((message = "Active"));
});

//Binance Connector
// const candles = require("../services/controllers/binanceConnectors/candles");
// candles("BTCUSDT", "1M", "2019-01-01", "2019-01-31");

const signalGen = require("../services/controllers/binanceConnectors/simpleTrend");
signalGen("BTCUSDT", "1d");

//Event Logger
const { logEvents } = require("../middleware/logEvents");
app.use(logEvents);

//Handle Errors
const errorHandler = require("../middleware/errorHandler");
const { signal } = require("nodemon/lib/config/defaults");
app.use(errorHandler);

module.exports = app;
