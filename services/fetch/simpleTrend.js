const exchange = require("./exchange");

const BEARISH = 1;
const BULLISH = 2;
const NONE = 0;

const detectPattern = (current, previous) => {
	const open = current[1];
	const close = current[4];
	const prevOpen = previous[1];
	const prevClose = previous[4];

	// console.log(`
	// Open: ${open}
	// Close: ${close}
	// prevOpen: ${prevOpen}
	// prevClose: ${prevClose}
	// `);

	if (
		open > close &&
		prevOpen < prevClose &&
		close < prevOpen &&
		open >= prevClose
	) {
		return BEARISH;
	} else if (
		open < close &&
		prevOpen > prevClose &&
		close > prevOpen &&
		open <= prevClose
	) {
		return BULLISH;
	} else {
		return NONE;
	}
};

const fetchDataAndGenerateSignal = async (symbol, interval) => {
	console.log("Fetching data...");
	const data = await exchange
		.fetchOHLCV(symbol, interval, undefined, 10)
		.catch((error) => {
			console.error("Error fetching OHLCV:", error);
			return []; // Return empty array on error
		});

	if (data.length < 2) {
		console.error("Insufficient data for signal generation");
		return [];
	}

	let patterns = [];
	for (let i = 1; i < data.length; i++) {
		const pattern = detectPattern(data[i], data[i - 1]);
		patterns.push(pattern);
	}

	console.log(patterns);
};

const signalGen = (symbol, interval) => {
	fetchDataAndGenerateSignal(symbol, interval); // Initial call
	setInterval(() => fetchDataAndGenerateSignal(symbol, interval), 60000); // Fetch every 60 seconds
};

module.exports = signalGen;
