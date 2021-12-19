/**
 * Data related to a service update.
 */
export interface ServiceUpdate<I, O> {
	/**
	 * The updated service.
	 */
	readonly service: I;

	/**
	 * The previous service.
	 */
	readonly previousService: I;

	/**
	 * The previously mapped service.
	 */
	readonly previousMappedService: O;
}

/**
 * Mapper that support both creation and updating of services.
 */
export interface AdvancedMapper<I, O> {
	/**
	 * Function used to map an instance the first time it is found. If this
	 * method returns a non-null value (after promise resolving) the service
	 * will be mapped and made available on the mapped discovery.
	 */
	create: Mapper<I, O>;

	/**
	 * Optional function used to update a service. If this method returns a
	 * non-null value (after promise resolving) the service will be updated on
	 * the mapped discovery.
	 */
	update?: (update: ServiceUpdate<I, O>) => Promise<O | null> | O | null;

	/**
	 * Destroy a mapped service when it becomes unavailable.
	 */
	destroy?: (service: O) => Promise<void> | void;
}

/**
 * Function that can be used to check if something can be assumed to be an
 * advanced mapper.
 *
 * @param o -
 *   object to check
 * @returns
 *   if o is AdvancedMapper
 */
export function isAdvancedMapper<I, O>(o: any): o is AdvancedMapper<I, O> {
	return typeof o === 'object' && typeof o.create === 'function';
}

/**
 * Mapper function, maps from an input to an input either synchronously or
 * asynchronously.
 */
export type Mapper<I, O> = (service: I) => Promise<O | null> | O | null;
