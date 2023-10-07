const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const exchange = require("../../../config/exchange");

const getUniqueFilename = async (baseFilename, directory) => {
	let filename = baseFilename;
	let count = 1;

	while (true) {
		try {
			await fsp.access(path.join(directory, filename), fs.constants.F_OK);
			// If file exists, this line will execute, and we move to the next filename
			filename = `${baseFilename}_${count}`;
			count++;
		} catch (error) {
			if (error.code === "ENOENT") {
				// File does not exist, so break out of the loop
				break;
			} else {
				throw error; // Some other error occurred
			}
		}
	}

	return filename;
};

const getIntervalDurationMs = (interval) => {
	const amount = parseInt(interval.slice(0, -1));
	const unit = interval.slice(-1);

	switch (unit) {
		case "M":
			return amount * 1000;
		case "m":
			return amount * 60 * 1000;
		case "h":
			return amount * 60 * 60 * 1000;
		case "D":
			return amount * 24 * 60 * 60 * 1000;
		default:
			throw new Error(`Unknown interval unit: ${unit}`);
	}
};

const candles = async (symbol, interval, startDate, endDate) => {
	// Create directory with symbol name if it doesn't exist
	try {
		await fsp.access(symbol, fs.constants.F_OK);
		// directory exists
	} catch (error) {
		if (error.code === "ENOENT") {
			// directory does not exist, so try to create it
			try {
				await fsp.mkdir(symbol);
			} catch (mkdirError) {
				console.error(`Error creating directory ${symbol}:`, mkdirError);
			}
		} else {
			console.error(`Error checking directory ${symbol}:`, error);
		}
	}

	// Construct the base filename
	let baseFilename = `${symbol}_${interval}_${startDate}_${endDate}.csv`;

	// Check if file exists and get a unique filename
	let uniqueFilename = await getUniqueFilename(baseFilename, symbol);

	// Create the write stream using the unique filename
	const writeStream = fs.createWriteStream(path.join(symbol, uniqueFilename));

	// Write the header to the CSV file
	writeStream.write("timestamp, open, high, low, close, volume");

	const limit = 1000; // number of candlesticks

	let currentStartTime = Date.parse(startDate);
	const endLimitTime = Date.parse(endDate);

	while (currentStartTime < endLimitTime) {
		let data = await exchange
			.fetchOHLCV(symbol, interval, currentStartTime, limit)
			.catch((error) => {
				console.error("Error fetching OHLCV:", error);
			});

		// Write data to CSV
		data.forEach((candle) => {
			writeStream.write(candle.join(", ") + "\n");
		});

		// Move the starting time for the next fetch by the duration of the fetched data
		currentStartTime += getIntervalDurationMs(interval) * data.length;

		console.log(
			`Data added for ${new Date(
				currentStartTime - getIntervalDurationMs(interval) * data.length
			)} to ${new Date(currentStartTime)}`
		);

		// Wait for 5 seconds before next request to respect rate limit
		await new Promise((res) => setTimeout(res, 5000));
	}

	writeStream.end();
};

module.exports = candles;
