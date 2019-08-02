import { Subscribable } from 'atvik';
import { Service } from '../service';
import { ServicePredicate } from '../predicate';
import { AdvancedMapper, Mapper } from '../mapper';

/**
 * API for discovering different services using a variety of protocols. This
 * API provides a simple contract that a consumer can use without knowing the
 * full details about the underlying discovery service.
 */
export interface ServiceDiscovery<S extends Service> {

	/**
	 * Event emitted when an error occurs for this discovery.
	 */
	readonly onError: Subscribable<this, [ Error ]>;

	/**
	 * Event emitted whenever a service is detected as available.
	 */
	readonly onAvailable: Subscribable<this, [ S ]>;

	/**
	 * Event emitted whenever a service is detected to be unavailable.
	 */
	readonly onUnavailable: Subscribable<this, [ S ]>;

	/**
	 * Event emitted when a service is available and is updated.
	 */
	readonly onUpdate: Subscribable<this, [ S, S ]>;

	/**
	 * Get a copy of the current services.
	 */
	readonly services: S[];

	/**
	 * Get a service using an identifier. Will return the service or
	 * `undefined`.
	 */
	get(id: string): S | null;

	/**
	 * Find the first service that match the given predicate. Will return
	 * the service or `undefined`.
	 *
	 * @param predicate
	 */
	find(predicate: ServicePredicate<S>): S | null;

	/**
	 * Find all of the services that match the given predicate. Will return
	 * an array with all of the matching services.
	 *
	 * @param predicate
	 */
	findAll(predicate: ServicePredicate<S>): S[];

	/**
	 * Filter the services discovered. This creates a new instance in which
	 * only services that pass the predicate function are available.
	 *
	 * The filtered discovery is only valid as long as this discovery is not
	 * destroyed. Calling `destroy()` on this discovery will destroy the
	 * filtered discovery.
	 *
	 * @param predicate
	 *   predicate used to filter items, if this function returns `true` the
	 *   service will be available in the filtered results
	 */
	filter(predicate: ServicePredicate<S>): ServiceDiscovery<S>;

	/**
	 * Map services returned by this discovery into another type of service.
	 *
	 * The mapped discovery is only valid as long as this discovery is not
	 * destroyed. Calling `destroy()` on this discovery will destroy the
	 * mapped discovery.
	 *
	 * @param mapper
	 */
	map<O extends Service>(mapper: AdvancedMapper<S, O> | Mapper<S, O>): ServiceDiscovery<O>;

	/**
	 * Merge this discovery with another instance that provides compatible
	 * services. Services will be merged using their `id`.
	 *
	 * @param other
	 */
	and<O extends Service>(other: ServiceDiscovery<O>): ServiceDiscovery<S | O>;

	/**
	 * Destroy this discovery. This should be called whenever the discovery
	 * is no longer needed. Destroying a discovery will ensure that no
	 * more events are triggered and that resources used by the discovery are
	 * released.
	 */
	destroy(): Promise<void>;

	/**
	 * Get if this discovery has been destroyed.
	 */
	readonly destroyed: boolean;

	/**
	 * Event called whenever this discovery is destroyed.
	 */
	readonly onDestroy: Subscribable<this>;
}
