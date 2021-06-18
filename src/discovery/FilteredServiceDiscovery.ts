import { Service } from '../Service';
import { ServicePredicate } from '../ServicePredicate';

import { LayeredServiceDiscovery } from './internal';
import { ServiceDiscovery } from './ServiceDiscovery';

/**
 * Provides filtering of any discovery instance.
 */
export class FilteredServiceDiscovery<S extends Service> extends LayeredServiceDiscovery<S, S> {
	private predicate: ServicePredicate<S>;

	public constructor(
		parent: ServiceDiscovery<S>,
		predicate: ServicePredicate<S>
	) {
		super('filtered', parent);

		this.predicate = predicate;
	}

	public get services(): S[] {
		return this.parent.services
			.filter(this.predicate);
	}

	public get(id: string) {
		const service = this.parent.get(id);
		if(service && this.predicate(service)) {
			return service;
		}

		return null;
	}

	protected handleParentServiceAvailable(service: S) {
		if(this.predicate(service)) {
			this.updateService(service);
		}
	}

	protected handleParentServiceUnavailable(service: S) {
		this.removeService(service);
	}

	protected handleParentServiceUpdate(service: S) {
		if(this.predicate(service)) {
			/*
			 * Either the service still matches or it now matches. Make it
			 * available in this discovery.
			 */
			this.updateService(service);
		} else {
			/*
			 * Remove the service is if it no longer matches.
			 */
			this.removeService(service.id);
		}
	}
}
