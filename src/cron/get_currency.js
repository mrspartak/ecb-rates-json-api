module.exports = function (options, { scriptName, run }) {
	let { __, cron, config, ecb, storage } = options;

	let schedule = config.DEBUG ? '* * * * *' : '5 * * * *';

	cron.schedule(schedule, () => {
		run(scriptName, doJob);
	});
	run(scriptName, doJob);

	async function doJob(jobLog) {
		let [err, data] = await __.to(ecb.today());
		if (err) return jobLog.error({ message: err.message, breakpoint: 'doJob', full_error: err });

		jobLog.info({ message: `got ecb.today ${data.ts}` });
		storage.set('rates-today', data);
	}
};
