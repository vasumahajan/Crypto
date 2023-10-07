const logger = require("../config/pinoLogger");
const pinoHttp = require("pino-http");

const httpLogger = pinoHttp({
	logger,
});

const logEvents = (req, res, next) => {
	httpLogger(req, res);
	next();
};

module.exports = { logEvents };
