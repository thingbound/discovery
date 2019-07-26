/**
 * Data related to a service update.
 */
export interface ServiceUpdate<I, O> {
	/**
	 * The updated service.
	 */
	service: I;

	/**
	 * The previous service.
	 */
	previousService: I;

	/**
	 * The previously mapped service.
	 */
	previousMappedService: O;
}

/**
 * Mapper that support both creation and updating of services.
 */
export interface AdvancedMapper<I, O> {
	create: Mapper<I, O>;

	update?: (update: ServiceUpdate<I, O>) => Promise<O | null> | O | null;

	destroy?: (service: O) => Promise<void> | void;
}

/**
 * Function that can be used to check if something can be assumed to be an
 * advanced mapper.
 *
 * @param o
 */
export function isAdvancedMapper<I, O>(o: any): o is AdvancedMapper<I, O> {
	return typeof o === 'object' && typeof o.create === 'function';
}

/**
 * Mapper function, maps from an input to an input either synchronously or
 * asynchronously.
 */
export type Mapper<I, O> = (service: I) => Promise<O | null> | O | null;
