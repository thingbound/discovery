'use strict';

const BasicDiscovery = require('./basic');

const { addService, removeService, parent } = require('./symbols');
const mapper = Symbol('mapper');
const available = Symbol('available');
const unavailable = Symbol('unavailable');

/**
 * Provides filtering of any discovery instance.
 */
module.exports = class MappedDiscovery extends BasicDiscovery {
	static get type() {
		return 'mapped';
	}

	constructor(parent_, mapper_) {
		super();

		this[parent] = parent_;
		this[mapper] = mapper_;

		this[available] = this[available].bind(this);
		this[unavailable] = this[unavailable].bind(this);

		if(parent_.active) {
			// Make sure we start if we are being filtered on an already started discovery
			parent_.on('available', this[available]);
			parent_.on('unavailable', this[unavailable]);

			for(const service of parent._services) {
				const mapped = mapper_(service);
				if(mapped && mapped.id) {
					this[addService](mapped);
				}
			}

			this.active = true;
		}
	}

	/**
	 * Start the discovery.
	 */
	start() {
		// Protect against starting twice and registering twice
		if(this[parent].active) return;

		this[parent].on('available', this[available]);
		this[parent].on('unavailable', this[unavailable]);

		this[parent].start();

		super.start();
	}

	/**
	 * Stop the discovery.
	 */
	stop() {
		this[parent].stop();
		this[parent].off('available', this[available]);
		this[parent].off('unavailable', this[unavailable]);

		super.stop();
	}

	[available](service) {
		const mapped = this[mapper](service);
		if(mapped && mapped.id) {
			this[addService](mapped);
		}
	}

	[unavailable](service) {
		// TODO: Maybe cache the id to skip mapping when services are removed?
		const mapped = this[mapper](service);
		if(mapped && mapped.id) {
			this[removeService](mapped.id);
		}
	}
}
