const winston = require('winston');

function init({ config }) {
	let level = 'info';
	if (config.ENV == 'development') level = 'debug';

	const logger = winston.createLogger({
		level,
		format: winston.format.combine(
			winston.format.timestamp({
				format: 'DD.MM.YY HH:mm:ss',
			}),
			winston.format.json(),
		),
		defaultMeta: config.DEFAULT_META
	});

	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(winston.format.simple()),
		}),
	);

	if (config.ENV == 'production' && config.APEX_LOGS_URL) {
		//
	}
	
	return logger;
}

module.exports = init;
