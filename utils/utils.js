const path = require('path');
const fs = require('fs');
const { assign } = require('lodash');
const crypto = require('crypto');
const requestIp = require('request-ip');
const _ = require('lodash');

/* path */
exports.ROOT_DIR = path.resolve(process.cwd(), './');
exports.path = function (userPath, settings = {}) {
	let defaultSettings = {
		__dirname: false,
	};
	settings = assign(defaultSettings, settings);

	return path.resolve(settings.__dirname ? settings.__dirname : process.cwd(), './', userPath);
};
exports.pathExists = function (userPath, extensions = ['']) {
	let filePath = exports.path(userPath);
	return extensions.some((extension) => {
		let tmpPath = extension == '' ? filePath : filePath + '.' + extension;
		return fs.existsSync(tmpPath);
	});
};
exports.modulesAt = function (userPath, settings = {}) {
	let defaultSettings = {
		camelCase: true,
		capitalize: true,
		localPath: false,
	};
	settings = assign(defaultSettings, settings);
	let filePath = settings.localPath ? userPath : exports.path(userPath);

	let files = fs.readdirSync(filePath),
		result = [];
	files.forEach((file) => {
		if (file.indexOf('.js') === -1) return;
		let file_name = file.replace('.js', '');

		let moduleName = file_name;
		if (settings.camelCase) moduleName = _.camelCase(moduleName);
		if (settings.capitalize) moduleName = _.capitalize(moduleName);

		result.push({
			path: userPath + '/' + file_name,
			name: moduleName,
		});
	});

	return result;
};

/* Network */
exports.getIP = function (req) {
	return requestIp.getClientIp(req);
};

/* stream */
exports.streamToBuffer = function (stream) {
	return new Promise((resolve, reject) => {
		let buf = Buffer.allocUnsafe(0);
		stream.on('data', (chunk) => {
			console.log(`chunk length ${chunk.length}`);
			buf = Buffer.concat([buf, chunk]);
		});
		stream.on('end', () => {
			return resolve(buf);
		});
		stream.on('error', (err) => {
			return reject(err);
		});
	});
};

/* string */
exports.trim = function (string, char) {
	if (char === ']') char = '\\]';
	if (char === '\\') char = '\\\\';
	return string.replace(new RegExp('^[' + char + ']+|[' + char + ']+$', 'g'), '');
};

exports.sanitizePath = function (path) {
	try {
		path = decodeURI(path);
		path = path.trim();
		path = path.replace(/\/+/, '/');
		path = exports.trim(path, '/');
		return exports.trim(path, '\\');
	} catch (e) {
		console.error('sanitizePath', e.message);
		return false;
	}
};

/* time */
exports.now = function () {
	return parseInt(new Date().getTime() / 1000);
};

/* promise */
exports.to = function (promise) {
	return promise
		.then((data) => {
			return [null, data];
		})
		.catch((err) => [err]);
};

/**
 * wraps a promise in a timeout, allowing the promise to reject if not resolve with a specific period of time
 * @param {integer} ms - milliseconds to wait before rejecting promise if not resolved
 * @param {Promise} promise to monitor
 * @example
 *  promiseTimeout(1000, fetch('https://courseof.life/johndoherty.json'))
 *      .then(function(cvData){
 *          alert(cvData);
 *      })
 *      .catch(function(){
 *          alert('request either failed or timed-out');
 *      });
 * @returns {Promise} resolves as normal if not timed-out, otherwise rejects
 */
exports.promiseTimeout = function (ms, promise) {
	return new Promise(function (resolve, reject) {
		// create a timeout to reject promise if not resolved
		var timer = requestTimeout(function () {
			reject(new Error('Promise Timed Out'));
		}, ms);

		promise
			.then(function (res) {
				clearRequestTimeout(timer);
				resolve(res);
			})
			.catch(function (err) {
				clearRequestTimeout(timer);
				reject(err);
			});
	});
};

exports.sleep = function (ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.asyncForEach = async function (array, callback) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
};

exports.allObject = async (object) => {
	return _.zipObject(_.keys(object), await Promise.all(_.values(object)));
};

/* randoms */
exports.checkConstant = function (constant, value) {
	return Object.values(constant).indexOf(value) == -1 ? false : true;
};

//length - 9 maximum
exports.uniqueID = function (length) {
	return Math.random().toString(36).substr(2, length);
};

exports.uniqueIDv2 = function (length) {
	return new Promise((resolve, reject) => {
		crypto.randomBytes(length, (err, buf) => {
			if (err) return reject(err);
			resolve(buf.toString('hex').substr(0, length));
		});
	});
};

//regex
exports.regExpEscape = function (str) {
	return str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
};