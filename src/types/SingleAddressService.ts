import { Service } from '../Service';
import { HostAndPort } from './HostAndPort';

/**
 * Service that is tied to one network address.
 */
export interface SingleAddressService extends Service {
	/**
	 * The address this service is available at.
	 */
	readonly address: HostAndPort;
}
