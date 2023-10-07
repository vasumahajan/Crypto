const app = require("./config/app");
const process = require("node:process");

const port = process.env.SERVER_PORT || 4000;
app.listen(port, (err) => {
	if (err) console.error(err.stack);
	console.log(`API server started on ${port}`);
});
