import { Service } from '../Service';

import { ExpiringServiceDiscovery } from './ExpiringServiceDiscovery';

export interface TimedDiscoveryOptions {
	/**
	 * The number of milliseconds a service is kept before it's removed unless
	 * it receives updates.
	 */
	expirationTime: number;

	/**
	 * The interval at which to search for services.
	 */
	searchTime: number;
}

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
