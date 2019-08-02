import { ServiceDiscovery } from './service-discovery';
import { Service } from '../service';

/**
 * Extension to `ServiceDiscovery` that supports releasing its resources.
 *
 * `destroy()` is designed so that a discovery that depends on other
 * discoveries, such as filtered discoveries, destroy the discoveries they
 * depend on. This is to make it easier to create filtered and mapped chains
 * and then ignore the root discovery.
 *
 * In some cases you want to keep the original discoveries around, in which
 * case you can call `release()` to destroy only this discovery and not the
 * ones it depends on.
 */
export interface ReleaseableServiceDiscovery<S extends Service> extends ServiceDiscovery<S> {
	/**
	 * Release the resources used by this discovery, without destroying
	 * discoveries it depends on.
	 *
	 * This will mark this discovery as destroyed.
	 */
	release(): Promise<void>;
}
