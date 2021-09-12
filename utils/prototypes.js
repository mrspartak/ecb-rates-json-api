RegExp.escape = function (string) {
	return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Array.prototype.fixedPush = function (element, length) {
	if (this.length + 1 > length) this.shift();
	this.push(element);
};

Array.prototype.getRandom = function () {
	return this[Math.floor(Math.random() * this.length)];
};
