const pino = require("pino");
const multiStream = require("pino-multi-stream").multistream;
const path = require("path");
const os = require("os");
const FileStreamRotator = require("file-stream-rotator");
const pretty = require("pino-pretty");

const environment = process.env.NODE_ENV || "development";
const logDir = path.resolve(__dirname, "../logs"); // Adjust directory as needed
const hostname = os.hostname();

// Check and create log directory if it doesn't exist
if (!require("fs").existsSync(logDir)) {
	require("fs").mkdirSync(logDir, { recursive: true });
}

// Setup Log Rotation
const stream = FileStreamRotator.getStream({
	date_format: "YYYYMMDD",
	filename: path.join(logDir, "pinoApp-%DATE%.log"),
	frequency: "daily",
	verbose: false,
});

const streams = [
	{ stream }, // Stream to Rotating Log File
];

// Redact sensitive info
const redact = ["req.headers.cookie", "req.body.password", "res.cookie"];

const logger = pino(
	{
		level: environment === "development" ? "debug" : "info",
		base: {
			environment,
			hostname,
		},
		pretty: environment === "development",
		redact,
		censor: "[REDACTED]",
	},
	multiStream(streams)
);

module.exports = logger;
