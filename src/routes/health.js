const Router = require('express-promise-router');
const router = new Router();

module.exports = function (options) {
	const { __, config, sendJson, sendJsonFail } = options;
	function getState() {
		let ts = __.now();
		return {
			state: config.STATE,
			uptime: ts - config.TS_START,
			timestamp: ts,
			id: config.ID,
		};
	}

	router.get('/liveness', (req, res) => {
		let state = getState();
		if (state.state != 'error') sendJson(res, state);
		else sendJsonFail(res, state);
	});

	router.get('/readiness', (req, res) => {
		let state = getState();
		if (state.state === 'up') sendJson(res, state);
		else sendJsonFail(res, state);
	});

	return router;
};
