import { ReschedulingTimerWheel } from 'timer-wheel';

import { Service } from '../Service.js';

import { BasicServiceDiscovery } from './internal.js';

/**
 * Options available when creating an expiring discovery.
 */
export interface ExpiringDiscoveryOptions {
	/**
	 * The number of milliseconds a service remains discovered without any
	 * updates.
	 */
	expirationTime: number;
}

/**
 * Discovery implementation that supports expiring services after a certain
 * amount of time.
 *
 * ```javascript
 * class CustomServiceDiscovery extends ExpiringServiceDiscovery {
 *   constructor() {
 *     super('discovery-id-here', {
 *       expirationTime: 30*60*1000 // expire after 30 minutes
 *     });
 *   }
 * }
 * ```
 */
export abstract class ExpiringServiceDiscovery<S extends Service> extends BasicServiceDiscovery<S> {
	public readonly expirationTime: number;

	private readonly expirationWheel: ReschedulingTimerWheel<string>;
	private expirationTimer: any;

	public constructor(type: string, options: ExpiringDiscoveryOptions) {
		if(! options) {
			throw new Error('options must be specified');
		}

		if(! options.expirationTime || options.expirationTime <= 0) {
			throw new Error('expirationTime option is required and needs to be a positive number');
		}

		super(type);

		this.expirationTime = options.expirationTime;
		this.expirationWheel = new ReschedulingTimerWheel();
		this.expirationTimer = setInterval(this.removeExpiredServices.bind(this), 1000);
	}

	protected override updateService(service: S, expirationTime?: number) {
		const result = super.updateService(service);

		// Schedule or reschedule the expiration of this service
		this.expirationWheel.schedule(service.id, expirationTime ?? this.expirationTime);

		return result;
	}

	protected override removeService(service: S | string) {
		const result = super.removeService(service);

		if(result) {
			// Remove from the expiration wheel
			this.expirationWheel.unschedule(result.id);
		}

		return result;
	}

	protected removeExpiredServices(timePassed?: number) {
		const expiredServices = this.expirationWheel.advance(timePassed);
		for(const serviceId of expiredServices) {
			this.removeService(serviceId);
		}
	}

	public override async destroy(): Promise<void> {
		clearInterval(this.expirationTimer);

		this.expirationTimer = undefined;

		await super.destroy();
	}
}
