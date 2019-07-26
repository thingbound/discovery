import { Service } from '../service';
import { HostAndPort } from './host-and-port';

/**
 * Service that is tied to one network address.
 */
export interface SingleAddressService extends Service {
	/**
	 * The address this service is available at.
	 */
	readonly address: HostAndPort;
}
