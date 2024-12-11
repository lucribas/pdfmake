'use strict';

function TraversalTracker() {
	this.events = {};
}

TraversalTracker.prototype.startTracking = function (event, callback) {
	var callbacks = this.events[event] || (this.events[event] = []);

	if (!callbacks.includes(callback)) {
		callbacks.push(callback);
	}
};

TraversalTracker.prototype.stopTracking = function (event, callback) {
	var callbacks = this.events[event];

	if (!callbacks) {
		return;
	}

	var index = callbacks.indexOf(callback);
	if (index >= 0) {
		callbacks.splice(index, 1);
	}
};

TraversalTracker.prototype.emit = async function (event, ...args) {
	var callbacks = this.events[event];

	if (!callbacks || callbacks.length === 0) {
		return;
	}

	await Promise.all(
		callbacks.map(async (callback) => {
			try {
				await callback(...args);
			} catch (error) {
				console.error(`Error in callback for event '${event}':`, error);
			}
		})
	);
};

TraversalTracker.prototype.auto = function (event, callback, innerFunction) {
	this.startTracking(event, callback);
	try {
		innerFunction();
	} finally {
		this.stopTracking(event, callback);
	}
};

module.exports = TraversalTracker;
