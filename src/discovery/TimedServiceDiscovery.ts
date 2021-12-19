import { Service } from '../Service.js';

import { ExpiringServiceDiscovery } from './ExpiringServiceDiscovery.js';

/**
 * Options available for {@link TimedDiscovery}.
 */
export interface TimedDiscoveryOptions {
	/**
	 * The number of milliseconds a service is kept before it's removed unless
	 * it receives updates.
	 */
	readonly expirationTime: number;

	/**
	 * The interval at which to search for services.
	 */
	readonly searchTime: number;
}

/**
 * Service discovery that combines service expiry with a timed discovery. Makes
 * it easy to perform searches at a timed interval.
 *
 * ```javascript
 * class CustomServiceDiscovery extends TimedServiceDiscovery {
 *   constructor() {
 *     super('discovery-id', {
 *       expirationTime: 30*60*1000, // remove services after 30 minutes
 *       searchTime: 5*60*1000 // search every 5 minutes
 *     });
 *
 *     // Perform an initial search
 *     this.search();
 *   }
 *
 *   protected search() {
 *      // Search for services here
 *   }
 * }
 * ```
 */
export abstract class TimedServiceDiscovery<S extends Service> extends ExpiringServiceDiscovery<S> {
	private readonly searchInterval: any;

	public constructor(type: string, options: TimedDiscoveryOptions) {
		super(type, options);

		const searchTime = options.searchTime;
		this.debug('Searching every', searchTime, 'ms');
		this.searchInterval = setInterval(() => {
			this.debug('Searching for services');
			try {
				this.search();
			} catch(ex) {
				this.logAndEmitError(ex, 'Caught error during search');
			}
		}, searchTime);
	}

	/**
	 * Perform a search for services.
	 */
	protected abstract search(): void;

	public async destroy(): Promise<void> {
		clearInterval(this.searchInterval);

		await super.destroy();
	}
}
