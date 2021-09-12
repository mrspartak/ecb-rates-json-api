const Router = require('express-promise-router');
const router = new Router();

module.exports = function (options, { log }) {
	const { sendJson, sendJsonFail, __, storage } = options;

	router.get('/all', (req, res) => {
		let data = storage.get('rates-today');
		if (!data) return sendJsonFail(res, 'no currency data');

		return sendJson(res, {
			ts: __.now(),
			rates: data.rates, // { CUR: RATE, ... }
		});
	});

	router.get('/fromto/:cur1/:cur2', (req, res) => {
		let data = storage.get('rates-today');
		if (!data) return sendJsonFail(res, 'no currency data');

		let currency1 = req.params.cur1.toUpperCase();
		let currency2 = req.params.cur2.toUpperCase();

		if (!data.rates[currency1]) return sendJsonFail(res, `No information about currency: ${currency1}`);
		if (!data.rates[currency2]) return sendJsonFail(res, `No information about currency: ${currency2}`);

		let rate = (data.rates[currency2] / data.rates[currency1]).toFixed(4);

		return sendJson(res, {
			ts: data.ts,
			rate: parseFloat(rate),
		});
	});

	router.get('/convert/:cur1/:cur2/:amount', (req, res) => {
		let data = storage.get('rates-today');
		if (!data) return sendJsonFail(res, 'no currency data');

		let currency1 = req.params.cur1.toUpperCase();
		let currency2 = req.params.cur2.toUpperCase();
		let amount = parseFloat(req.params.amount);

		if (!data.rates[currency1]) return sendJsonFail(res, `No information about currency: ${currency1}`);
		if (!data.rates[currency2]) return sendJsonFail(res, `No information about currency: ${currency2}`);
		if (isNaN(amount)) return sendJsonFail(res, `Amount is not a number`);

		let convertedAmount = ((amount * data.rates[currency2]) / data.rates[currency1]).toFixed(2);

		return sendJson(res, {
			ts: data.ts,
			amount: parseFloat(convertedAmount),
		});
	});

	return router;
};
