import { Event } from 'atvik';
import debug from 'debug';

import { ServicePublisher } from './ServicePublisher';

/**
 * Abstract base class to simplify implementation of publishers.
 */
export abstract class AbstractServicePublisher implements ServicePublisher {
	/**
	 * Debugger that can be used to output debug messages for the publisher.
	 */
	protected readonly debug: debug.Debugger;
	/**
	 * Event used to emit errors for this publisher.
	 */
	protected readonly errorEvent: Event<this, [ Error ]>;

	public constructor(type: string) {
		this.debug = debug('discovery:publisher:' + type);

		this.errorEvent = new Event(this);
	}

	public get onError() {
		return this.errorEvent.subscribable;
	}

	/**
	 * Log and emit an error for this discovery.
	 *
	 * @param error -
	 *   error that occurred
	 * @param message -
	 *   message that should be logged for the error
	 */
	protected logAndEmitError(error: Error, message: string = 'An error occurred:') {
		this.debug(message, error);
		this.errorEvent.emit(error);
	}

	/**
	 * Destroy this instance.
	 */
	public abstract destroy(): Promise<void>;
}
