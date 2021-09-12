module.exports = async function (options) {
	let { __, _, app, log } = options;

	const logger = log.child({ place: 'routes/load' });

	//middleware
	options.mdlwr = {};

	options.sendJson = function (res, body, status = 200) {
		res.status(status).json(body);
	};
	options.sendJsonFail = function (res, error, data = undefined) {
		options.sendJson(res, { success: false, error, data }, 200);
	};

	//load modules dynamicaly
	let modules = __.modulesAt(__.path('src/routes/'), {
		camelCase: false,
		capitalize: false,
	});

	_.each(modules, (module) => {
		if (module.name == '_load') return;

		options.moduleName = module.name;
		if (module.name == 'index') module.name = '';

		let routeLogger = log.child({ place: `routes/${module.name}` });

		logger.debug({ message: `route /${module.name} loaded` });
		app.use('/' + module.name, require(module.path)(options, { log: routeLogger }));
	});

	return app;
};

/* 
	/all
	/fromto/eur/usd/


*/
