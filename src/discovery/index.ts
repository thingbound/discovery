export * from './ServiceDiscovery.js';
export * from './ReleasableServiceDiscovery.js';

export {
	AbstractServiceDiscovery,
	BasicServiceDiscovery,
	LayeredServiceDiscovery,
	MergedServiceDiscovery
} from './internal.js';

export * from './ExpiringServiceDiscovery.js';
export * from './TimedServiceDiscovery.js';
export * from './ManualServiceDiscovery.js';
