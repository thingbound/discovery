'use strict';

const AbstractDiscovery = require('./abstract');

const { addService, removeService, setServices, events, services } = require('./symbols');

/**
 * Basic discovery implementation. Provides a getter for fetching services
 * and hidden methods for manipulating the active services. Events are emitted
 * when service availability changes, `available` when a service becomes
 * available and `unavailable` when it becomes unavailable.
 */
module.exports = class BasicDiscovery extends AbstractDiscovery {
	constructor() {
		super();

		this[services] = new Map();

		this.active = false;
	}

	/**
	 * Get all the available services.
	 */
	get services() {
		return Array.from(this[services].values())
			.filter(s => s.available)
			.map(s => s.data);
	}

	start() {
		this.active = true;
	}

	stop() {
		this.active = false;
	}

	/**
	 * Add or update a service that has been found.
	 *
	 * @param {object} service
	 */
	[addService](service) {
		if(! service.id) {
			throw new Error('Services must have an identifier');
		}

		let registration = this[services].get(service.id);
		if(! registration) {
			/*
			 * Set up the initial registration if we haven't seen this service
			 * before.
			 */
			registration = {
				id: service.id,
				data: service
			};

			this[services].set(service.id, registration);
		}

		const wasAvailable = registration.available;

		// Update availability and when the service was last seen
		registration.lastSeen = Date.now();
		registration.available = true;

		if(! wasAvailable) {
			// Service was previously unavailable, emit event
			this[events].emit('available', registration.data, this);
		}
	}

	/**
	 * Remove a service that is no longer available.
	 *
	 * @param {object|string} service
	 */
	[removeService](service) {
		const id = typeof service === 'string' ? service : service.id;
		const registration = this[services].get(id);
		if(registration) {
			// Remove the service completely
			this[services].delete(id);

			if(registration.available) {
				// Service was available, emit event
				this[events].emit('unavailable', registration.data, this);
			}
		}
	}

	/**
	 * Set the services that should be available.
	 *
	 * @param {array[object]} available
	 */
	[setServices](available) {
		const ids = new Set();
		for(const service of available) {
			ids.add(service.id);

			// Always add the service so that lastSeen is updated
			this[addService](service);
		}

		// Remove all services that are no longer available
		for(const id of this[services].keys()) {
			if(! ids.has(id)) {
				this[removeService](id);
			}
		}
	}
};
