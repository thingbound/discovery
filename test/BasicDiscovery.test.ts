import { BasicServiceDiscovery } from '../src/discovery/internal';
import { Service } from '../src/Service';

import { TestService } from './TestService';

describe('Basic Discovery', () => {

	it('updateService handles initial add', () => {
		const d = new TestDiscovery<TestService>();

		let gotAvailable = false;
		d.onAvailable(() => gotAvailable = true);

		const service = new TestService('test:1', null);
		d.updateService(service);

		expect(gotAvailable).toEqual(true);
		expect(d.services).toEqual([ service ]);
	});

	it('updateService handles update', () => {
		const d = new TestDiscovery<TestService>();

		let gotAvailable = false;
		d.onAvailable(() => gotAvailable = true);

		let gotUpdate = false;
		d.onUpdate(() => gotUpdate = true);

		const s1 = new TestService('test:1', null);
		d.updateService(s1);

		expect(gotAvailable).toEqual(true);

		const s2 = new TestService('test:1', 'data');
		d.updateService(s2);

		expect(gotUpdate).toEqual(true);

		expect(d.services).toEqual([ s2 ]);
	});

	it('updateService skips update on same data', () => {
		const d = new TestDiscovery<TestService>();

		let gotAvailable = false;
		d.onAvailable(() => gotAvailable = true);

		let gotUpdate = false;
		d.onUpdate(() => gotUpdate = true);

		const s1 = new TestService('test:1', null);
		d.updateService(s1);

		expect(gotAvailable).toEqual(true);

		const s2 = new TestService('test:1', null);
		d.updateService(new TestService('test:1', null));

		expect(gotUpdate).toEqual(false);
		expect(d.services[0]).toBe(s1);
	});

	it('removeService removes service', () => {
		const d = new TestDiscovery<TestService>();

		let gotUnvailable = false;
		d.onUnavailable(() => gotUnvailable = true);

		d.updateService(new TestService('test:1', null));

		d.removeService('test:1');

		expect(gotUnvailable).toEqual(true);
		expect(d.services).toEqual([]);
	});
});

class TestDiscovery<S extends Service> extends BasicServiceDiscovery<S> {

	constructor() {
		super('test');
	}

	public updateService(service: S) {
		return super.updateService(service);
	}

	public removeService(service: S | string) {
		return super.removeService(service);
	}
}
