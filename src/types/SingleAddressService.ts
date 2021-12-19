import { Service } from '../Service.js';

import { HostAndPort } from './HostAndPort.js';

/**
 * Service that is tied to one network address.
 */
export interface SingleAddressService extends Service {
	/**
	 * The address this service is available at.
	 */
	readonly address: HostAndPort;
}
