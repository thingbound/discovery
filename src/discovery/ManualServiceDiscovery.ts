import { Service } from '../Service.js';

import { BasicServiceDiscovery } from './internal.js';

/**
 * Discovery implementation for manually adding or removing available services.
 */
export class ManualServiceDiscovery<S extends Service> extends BasicServiceDiscovery<S> {
	public constructor(type = 'manual') {
		super(type);
	}

	/**
	 * Add a service that should be available.
	 *
	 * @param service -
	 *   service that is either
	 */
	public add(service: S) {
		this.updateService(service);
	}

	/**
	 * Remove a service so that it is no longer available.
	 *
	 * @param service -
	 */
	public remove(service: S | string) {
		this.removeService(service);
	}

	/**
	 * Set the services that are available.
	 *
	 * @param services -
	 *   services that should be available
	 */
	public set(services: Iterable<S>) {
		this.setServices(services);
	}
}
