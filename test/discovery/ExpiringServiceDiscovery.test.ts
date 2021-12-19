import { ExpiringServiceDiscovery } from '../../src/discovery/ExpiringServiceDiscovery';
import { Service } from '../../src/Service';
import { TestService } from '../TestService';

describe('ExpiringServiceDiscovery', function() {
	it('single service is removed', async function() {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service, 500);

		expect(d.services).toEqual([ service ]);

		d.removeExpiredServices(2000);
		expect(d.services).toEqual([ ]);

		await d.destroy();
	});

	it('single service is not removed', async function() {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service, 1000);

		expect(d.services).toEqual([ service ]);

		// Reschedule removal
		d.updateService(service, 10000);

		d.removeExpiredServices(2000);

		expect(d.services).toEqual([ service ]);

		await d.destroy();
	});

	it('multiples services are removed', async function() {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1, 500);
		const s2 = new TestService('test:2', null);
		d.updateService(s2, 500);

		expect(d.services).toEqual([ s1, s2 ]);

		d.removeExpiredServices(2000);
		expect(d.services).toEqual([ ]);

		await d.destroy();
	});

	it('multiples services with different times are removed', async function() {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1, 1000);

		const s2 = new TestService('test:2', null);
		d.updateService(s2, 3000);

		expect(d.services).toEqual([ s1, s2 ]);

		d.removeExpiredServices(10000);
		expect(d.services).toEqual([ ]);

		await d.destroy();
	});
});

class TestDiscovery<S extends Service> extends ExpiringServiceDiscovery<S> {
	public constructor() {
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
