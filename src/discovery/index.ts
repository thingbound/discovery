export * from './ServiceDiscovery';
export * from './ReleasableServiceDiscovery';

export {
	AbstractServiceDiscovery,
	BasicServiceDiscovery,
	LayeredServiceDiscovery,
	MergedServiceDiscovery
} from './internal';

export * from './ExpiringServiceDiscovery';
export * from './TimedServiceDiscovery';
export * from './ManualServiceDiscovery';
