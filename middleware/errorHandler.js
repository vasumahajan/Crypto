const logger = require("../config/pinoLogger");

const errorHandler = (err, req, res, next) => {
	logger.error({ req, err }, "An Error Occurred");

	// Send a generic error message for unexpected errors
	let status = err.status || 500;
	let message = status === 500 ? "An unexpected error occurred" : err.message;
	res.status(status).send({ error: message });
};

module.exports = errorHandler;
