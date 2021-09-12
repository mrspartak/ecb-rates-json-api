module.exports = async function (options) {
	let { __, _, log } = options;

	async function run(scriptName, fn) {
		let runStats = {
			logs: [],
		};

		let jobLog = log.child({ place: `cron/${scriptName}` });

		jobLog.info(`START ${scriptName}`);

		runStats.tsStart = new Date().getTime() / 1000;
		try {
			await fn(jobLog);
		} catch (err) {
			jobLog.error({ message: err.message ? err.message : 'Catch error', breakpoint: 'load.catch', full_error: err });
			runStats.error = err.message;
		}
		runStats.tsFinish = new Date().getTime() / 1000;
		runStats.duration = +(runStats.tsFinish - runStats.tsStart).toFixed(1);

		jobLog.info({ message: `FINISH ${scriptName} in +${runStats.duration} seconds`, duration: runStats.duration });
	}

	//load modules dynamicaly
	let modules = __.modulesAt(__.path('src/cron'), {
		camelCase: false,
		capitalize: false,
	});

	_.each(modules, (module) => {
		if (module.name == '_load') return;

		log.debug(`scripts.loaded ${module.name}`);

		let jobLog = log.child({ place: `cron/${module.name}` });
		require(module.path)(options, { scriptName: module.name, run, jobLog });
	});
};
