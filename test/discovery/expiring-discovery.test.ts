import { ExpiringServiceDiscovery } from '../../src/discovery/expiring-service-discovery';
import { Service } from '../../src/service';

import { TestService } from '../test-service';

describe('Timed Discovery', function() {

	it('single service is removed', function() {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service, 500);

		expect(d.services).toEqual([ service ]);

		d.removeExpiredServices(2000);
		expect(d.services).toEqual([ ]);

		d.destroy();
	});

	it('single service is not removed', function() {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service, 1000);

		expect(d.services).toEqual([ service ]);

		// Reschedule removal
		d.updateService(service, 10000);

		d.removeExpiredServices(2000);

		expect(d.services).toEqual([ service ]);

		d.destroy();
	});

	it('multiples services are removed', function() {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1, 500);
		const s2 = new TestService('test:2', null);
		d.updateService(s2, 500);

		expect(d.services).toEqual([ s1, s2 ]);

		d.removeExpiredServices(2000);
		expect(d.services).toEqual([ ]);

		d.destroy();
	});

	it('multiples services with different times are removed', function() {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1, 1000);

		const s2 = new TestService('test:2', null);
		d.updateService(s2, 3000);

		expect(d.services).toEqual([ s1, s2 ]);

		d.removeExpiredServices(10000);
		expect(d.services).toEqual([ ]);

		d.destroy();
	});
});

class TestDiscovery<S extends Service> extends ExpiringServiceDiscovery<S> {

	constructor() {
		super('test', {
			expirationTime: 500
		});
	}

	public updateService(service: S, expirationTime: number) {
		return super.updateService(service, expirationTime);
	}

	public removeService(service: S | string) {
		return super.removeService(service);
	}

	public removeExpiredServices(timePassed: number) {
		super.removeExpiredServices(timePassed);
	}
}
