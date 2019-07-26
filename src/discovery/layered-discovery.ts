import { Discovery } from './discovery';
import { Service } from '../service';
import { BasicDiscovery } from './internal';

/**
 * Abstract discovery for implementing layers, such as filtering and mapping.
 */
export abstract class LayeredDiscovery<S extends Service, P extends Service> extends BasicDiscovery<S> {
	protected readonly parent: Discovery<P>;

	constructor(type: string, parent: Discovery<P>) {
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
	 * @param service
	 */
	protected abstract handleParentServiceAvailable(service: P): void;

	/**
	 * Handle that a service is no longer available.
	 *
	 * @param service
	 */
	protected abstract handleParentServiceUnavailable(service: P): void;

	/**
	 * Handle that a service has been updated.
	 */
	protected abstract handleParentServiceUpdate(service: P, previousService: P): void;

	/**
	 * Destroy this discovery.
	 */
	public destroy() {
		if(this.destroyed) return;

		this.parent.onAvailable.unsubscribe(this.handleParentServiceAvailable);
		this.parent.onUnavailable.unsubscribe(this.handleParentServiceUnavailable);
		this.parent.onUpdate.unsubscribe(this.handleParentServiceUpdate);

		this.parent.onDestroy.unsubscribe(this.destroy);

		super.destroy();
	}
}
