import { ExpiringDiscovery } from '../src/discovery/expiring-discovery';
import { Service } from '../src/service';

import { TestService } from './test-service';

describe('Timed Discovery', () => {

	it('single service is removed', (done) => {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service);

		expect(d.services).toEqual([ service ]);

		setTimeout(() => {
			expect(d.services).toEqual([ ]);

			done();
		}, 60);
	});

	it('single service is not removed', (done) => {
		const d = new TestDiscovery<TestService>();

		const service = new TestService('test:1', null);
		d.updateService(service);

		expect(d.services).toEqual([ service ]);

		setTimeout(() => d.updateService(service), 25);

		setTimeout(() => {
			expect(d.services).toEqual([ service ]);

			done();
		}, 60);
	});

	it('multiples services are removed', (done) => {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1);
		const s2 = new TestService('test:2', null);
		d.updateService(s2);

		expect(d.services).toEqual([ s1, s2 ]);

		setTimeout(() => {
			expect(d.services).toEqual([ ]);

			done();
		}, 60);
	});

	it('multiples services with different times are removed', (done) => {
		const d = new TestDiscovery<TestService>();

		const s1 = new TestService('test:1', null);
		d.updateService(s1);

		setTimeout(() => {
			const s2 = new TestService('test:2', null);
			d.updateService(s2);

			expect(d.services).toEqual([ s1, s2 ]);
		}, 25);

		setTimeout(() => {
			expect(d.services).toEqual([ ]);

			done();
		}, 60);
	});
});

class TestDiscovery<S extends Service> extends ExpiringDiscovery<S> {

	constructor() {
		super('test', {
			maxStaleTime: 50
		});
	}

	public updateService(service: S) {
		return super.updateService(service);
	}

	public removeService(service: S | string) {
		return super.removeService(service);
	}
}
