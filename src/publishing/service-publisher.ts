import { Subscribable } from 'atvik';

/**
 * Service this is published for the discovery. A published service is exposed
 * and discoverable until `destroy()` is called.
 */
export interface ServicePublisher {
	/**
	 * Event emitted when an error occurs during publishing.
	 */
	readonly onError: Subscribable<this, [ Error ]>;

	/**
	 * Destroy the publisher, effectively unpublishing the service.
	 */
	destroy(): Promise<void>;
}
