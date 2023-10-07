const ccxt = require("ccxt");

const exchange = new ccxt.binance({
	apiKey: process.env.BNC_API_KEY,
	secret: process.env.BNC_SECRET_KEY,
});

module.exports = exchange;
