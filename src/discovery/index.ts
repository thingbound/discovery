export * from './service-discovery';
export * from './releaseable-service-discovery';

export {
	AbstractServiceDiscovery,
	BasicServiceDiscovery,
	LayeredServiceDiscovery,
	MergedServiceDiscovery
} from './internal';

export * from './expiring-service-discovery';
export * from './timed-service-discovery';
export * from './manual-service-discovery';
