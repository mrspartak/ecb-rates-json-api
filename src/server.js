function APP(options) {
	return new Promise(async (resolve, reject) => {
		require('dotenv').config();

		const express = require('express');
		const app = express();
		const cron = require('node-cron');
		const _ = require('lodash');
		const __ = require('../utils/utils');
		const storage = require(__.path('utils/storage'));
		require(__.path('utils/prototypes'));

		/* Config from env */
		const config = {
			LOCAL: process.env.LOCAL || false,
			ENV: process.env.ENV || 'development',

			APP_PORT: process.env.APP_PORT || 2401,
			API_URL: process.env.API_URL || 'http://127.0.0.1:2401',

			DEBUG: process.env.DEBUG || false,
			ID: (await __.uniqueIDv2(2)).toLocaleUpperCase(),
			TS_START: __.now(),
			STATE: 'loading',
		};
		config.DEFAULT_META = {
			service: 'api',
			taskID: `#${config.ID}`,
			server: process.env.SERVER_HOSTNAME,
		};

		storage.set('test', 123);

		/* Logger */
		const log = require(__.path('utils/log'))({
			config,
		});
		const logger = log.child({ place: 'server.js' });
		logger.debug({ message: 'initialization: config, log' });

		process.on('uncaughtException', (err) => {
			log.error({ place: 'server', breakPoint: 'uncaughtException', message: err.message, stack: err.stack });
			setTimeout(() => {
				process.exit();
			}, 10000);
		});

		/* Initial modules pool */
		const initModules = { __, _, log, config, cron, storage };

		/* ecb api */
		const ecb = require(__.path('utils/ecb'))({ config });

		/* Middleware */
		const bodyParser = require('body-parser');

		app.set('trust proxy', true);
		app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

		app.use((req, res, next) => {
			logger.info({
				breakpoint: 'http.request',
				message: `${req.method} ${req.path} | session: ${req.session && req.session.userID ? req.session.userID : false}`,
				path: req.path,
				method: req.method,
				request: `${req.method} ${req.path}`,
			});
			next();
		});
		logger.debug({ message: 'initialization: express' });

		/* Whole modules pool */
		_.assign(initModules, { app, ecb });

		/* Cron modules */
		await require(__.path('src/cron/_load'))(initModules);

		/* Routes modules */
		await require(__.path('src/routes/_load'))(initModules);
		logger.debug({ message: 'initialization: api routes' });

		return resolve(initModules);
	});
}

module.exports = APP;
