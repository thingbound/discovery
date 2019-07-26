import { Service } from '../service';
import { HostAndPort } from './host-and-port';

/**
 * Service that is tied to one or more network addresses.
 */
export interface MultiAddressService extends Service {
	/**
	 * The addresses that are available for this service.
	 */
	readonly addresses: HostAndPort[];
}
