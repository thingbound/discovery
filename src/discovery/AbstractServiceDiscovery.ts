import { Event } from 'atvik';
import debug from 'debug';

import { AdvancedMapper, Mapper, isAdvancedMapper } from '../mapper.js';
import { Service } from '../Service.js';
import { ServicePredicate } from '../ServicePredicate.js';

import { FilteredServiceDiscovery, MappedServiceDiscovery, MergedServiceDiscovery } from './internal.js';
import { ServiceDiscovery } from './ServiceDiscovery.js';

/**
 * Abstract service discovery implementation.
 */
export abstract class AbstractServiceDiscovery<S extends Service> implements ServiceDiscovery<S> {
	/**
	 * Debugger that can be used to output debug messages for the discovery.
	 */
	protected readonly debug: debug.Debugger;
	/**
	 * Event used to emit errors for this discovery.
	 */
	private readonly errorEvent: Event<this, [ err: Error ]>;

	/**
	 * Event used to emit when a service is available.
	 */
	protected readonly availableEvent: Event<this, [ service: S ]>;
	/**
	 * Event used to emit when a service is no longer available.
	 */
	protected readonly unavailableEvent: Event<this, [ service: S ]>;
	/**
	 * Event used to emit when a service has been updated.
	 */
	protected readonly updateEvent: Event<this, [ service: S, previousService: S ]>;

	/**
	 * Services that are available from this discovery.
	 */
	public abstract readonly services: S[];

	/**
	 * Get if this discovery has been destroyed.
	 */
	private _destroyed: boolean;
	/**
	 * Event used to emit when this discovery is destroyed.
	 */
	private readonly destroyEvent: Event<this>;

	public constructor(type: string) {
		this.debug = debug('th:discovery:' + type);
		this.errorEvent = new Event(this);

		this.availableEvent = new Event(this);
		this.unavailableEvent = new Event(this);
		this.updateEvent = new Event(this);

		this._destroyed = false;
		this.destroyEvent = new Event(this);
	}

	public get onError() {
		return this.errorEvent.subscribable;
	}

	/**
	 * Log and emit an error for this discovery.
	 *
	 * @param error -
	 * @param message -
	 */
	protected logAndEmitError(error: unknown, message: string = 'An error occurred:') {
		this.debug(message, error);
		this.errorEvent.emit(error instanceof Error ? error : new Error(String(error)));
	}

	public get onAvailable() {
		return this.availableEvent.subscribable;
	}

	public get onUnavailable() {
		return this.unavailableEvent.subscribable;
	}

	public get onUpdate() {
		return this.updateEvent.subscribable;
	}

	public abstract get(id: string): S | null;

	public find(predicate: ServicePredicate<S>): S | null {
		for(const service of this.services) {
			if(predicate(service)) {
				return service;
			}
		}

		return null;
	}

	public findAll(predicate: ServicePredicate<S>): S[] {
		const result = [];
		for(const service of this.services) {
			if(predicate(service)) {
				result.push(service);
			}
		}

		return result;
	}

	public filter(predicate: ServicePredicate<S>): ServiceDiscovery<S> {
		return new FilteredServiceDiscovery(this, predicate);
	}

	public map<O extends Service>(mapper: AdvancedMapper<S, O> | Mapper<S, O>): ServiceDiscovery<O> {
		if(isAdvancedMapper<S, O>(mapper)) {
			// If called using an advanced mapper create directly
			return new MappedServiceDiscovery(this, mapper);
		}

		// Create an advanced mapper from the mapping function
		return new MappedServiceDiscovery(this, {
			create: mapper
		});
	}

	public and<O extends Service>(other: ServiceDiscovery<O>): ServiceDiscovery<S | O> {
		throw new MergedServiceDiscovery<S | O>([ this, other ]);
	}

	public destroy(): Promise<void> {
		if(this.destroyed) return Promise.resolve();

		this._destroyed = true;
		this.destroyEvent.emit();

		return Promise.resolve();
	}

	public get destroyed() {
		return this._destroyed;
	}

	public get onDestroy() {
		return this.destroyEvent.subscribable;
	}
}
