import { ExpiringDiscovery} from './expiring-discovery';
import { Service } from '../service';

export interface TimedDiscoveryOptions {
	/**
	 * The number of milliseconds something is allowed to be stale.
	 */
	maxStaleTime?: number;

	/**
	 * The interval at which to search for services.
	 */
	searchTime?: number;
}

function resolveMaxStaleTime(options: TimedDiscoveryOptions): number {
	if(typeof options.maxStaleTime === 'number') {
		return options.maxStaleTime;
	}

	if(typeof options.searchTime === 'number') {
		if(options.searchTime <= 0) {
			throw new Error('searchTime must be more than zero milliseconds, or maxStaleTime must be specified');
		}

		return options.searchTime * 3;
	} else {
		throw new Error('searchTime or maxStaleTime are required');
	}
}

function resolveSearchTime(options: TimedDiscoveryOptions): number {
	if(typeof options.searchTime === 'number') {
		if(options.searchTime <= 0) {
			throw new Error('searchTime must be more than zero milliseconds, or maxStaleTime must be specified');
		}

		return options.searchTime;
	}

	if(typeof options.maxStaleTime === 'number') {
		if(options.maxStaleTime <= 0) {
			throw new Error('maxStaleTime must be more than zero milliseconds, or searchTime must be specified');
		}

		return Math.max(100, options.maxStaleTime / 3);
	} else {
		throw new Error('searchTime or maxStaleTime are required');
	}
}

export abstract class TimedDiscovery<S extends Service> extends ExpiringDiscovery<S> {
	private readonly searchInterval: any;

	constructor(type: string, options: TimedDiscoveryOptions) {
		if(! options) {
			throw new Error('options are required');
		}

		super(type, {
			maxStaleTime: resolveMaxStaleTime(options)
		});

		const searchTime = resolveSearchTime(options);
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
