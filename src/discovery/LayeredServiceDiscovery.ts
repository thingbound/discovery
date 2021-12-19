import { Service } from '../Service.js';

import { BasicServiceDiscovery } from './internal.js';
import { ReleaseableServiceDiscovery } from './ReleasableServiceDiscovery.js';
import { ServiceDiscovery } from './ServiceDiscovery.js';

/**
 * Abstract discovery for implementing layers, such as filtering and mapping.
 */
export abstract class LayeredServiceDiscovery<S extends Service, P extends Service>
	extends BasicServiceDiscovery<S>
	implements ReleaseableServiceDiscovery<S> {
	/**
	 * Parent discovery that is being modified.
	 */
	protected readonly parent: ServiceDiscovery<P>;

	/**
	 * Create a new instance.
	 *
	 * @param type -
	 *   type of layer
	 * @param parent -
	 *
	 */
	public constructor(type: string, parent: ServiceDiscovery<P>) {
		super(type);

		this.parent = parent;

		this.handleParentServiceAvailable = this.handleParentServiceAvailable.bind(this);
		this.handleParentServiceUnavailable = this.handleParentServiceUnavailable.bind(this);
		this.handleParentServiceUpdate = this.handleParentServiceUpdate.bind(this);
		this.destroy = this.destroy.bind(this);

		this.parent.onAvailable(this.handleParentServiceAvailable);
		this.parent.onUnavailable(this.handleParentServiceUnavailable);
		this.parent.onUpdate(this.handleParentServiceUpdate);

		// Bind so that this layer id destroyed when the parent is
		this.parent.onDestroy(this.destroy);

		// Make the current services available
		for(const service of parent.services) {
			this.handleParentServiceAvailable(service);
		}
	}

	/**
	 * Handle that a service is now available.
	 *
	 * @param service -
	 *   service that is becoming available
	 */
	protected abstract handleParentServiceAvailable(service: P): void;

	/**
	 * Handle that a service is no longer available.
	 *
	 * @param service -
	 *   service that is becoming unavailable
	 */
	protected abstract handleParentServiceUnavailable(service: P): void;

	/**
	 * Handle that a service has been updated.
	 *
	 * @param service -
	 *   service that has updated
	 * @param previousService -
	 *   previous service instance
	 */
	protected abstract handleParentServiceUpdate(service: P, previousService: P): void;

	/**
	 * Release this discovery, it will no longer receive any service updates.
	 */
	public async release(): Promise<void> {
		if(this.destroyed) return;

		this.parent.onAvailable.unsubscribe(this.handleParentServiceAvailable);
		this.parent.onUnavailable.unsubscribe(this.handleParentServiceUnavailable);
		this.parent.onUpdate.unsubscribe(this.handleParentServiceUpdate);

		this.parent.onDestroy.unsubscribe(this.destroy);

		await super.destroy();
	}

	/**
	 * Destroy this discovery and its parent.
	 */
	public async destroy(): Promise<void> {
		if(this.destroyed) return;

		// Destroy the parent
		await this.parent.destroy();

		// Release our resources.
		await this.release();
	}
}
