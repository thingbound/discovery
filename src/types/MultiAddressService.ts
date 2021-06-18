import { Service } from '../Service';

import { HostAndPort } from './HostAndPort';

/**
 * Service that is tied to one or more network addresses.
 */
export interface MultiAddressService extends Service {
	/**
	 * The addresses that are available for this service.
	 *
	 * When implementing a service with multiple addresses the array should
	 * be sorted using `HostAndPort.compare`.
	 */
	readonly addresses: HostAndPort[];
}
