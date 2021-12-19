import { HostAndPort } from '../../src/types/HostAndPort.js';

describe('HostAndPort', function() {
	it('fromString([2001:db8::1]) => OK', function() {
		const instance = HostAndPort.fromString('[2001:db8::1]');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('2001:db8::1');
		expect(instance.port).toEqual(0);
	});

	it('fromString([2001:db8::1]:80) => OK', function() {
		const instance = HostAndPort.fromString('[2001:db8::1]:80');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('2001:db8::1');
		expect(instance.port).toEqual(80);
	});

	it('fromString([2001]:80) => null', function() {
		const instance = HostAndPort.fromString('[2001]:80');
		if(instance) {
			fail();
		}
	});

	it('fromString([2001:db8::1) => null', function() {
		const instance = HostAndPort.fromString('[2001:db8::1');
		if(instance) {
			fail();
		}
	});

	it('fromString(2001:db8::1) => OK', function() {
		const instance = HostAndPort.fromString('2001:db8::1');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('2001:db8::1');
		expect(instance.port).toEqual(0);
	});

	it('fromString(2001:db8:NOPE:1) => null', function() {
		const instance = HostAndPort.fromString('2001:db8:NOPE:1');
		if(instance) {
			fail();
		}
	});

	it('fromString(192.0.0.1) => OK', function() {
		const instance = HostAndPort.fromString('192.0.0.1');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('192.0.0.1');
		expect(instance.port).toEqual(0);
	});

	it('fromString(192.0.0.1:80) => OK', function() {
		const instance = HostAndPort.fromString('192.0.0.1:80');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('192.0.0.1');
		expect(instance.port).toEqual(80);
	});

	it('fromString(192.0.0.1::80) => null', function() {
		const instance = HostAndPort.fromString('192.0.0.1::80');
		if(instance) {
			fail();
		}
	});

	it('fromString(example.com) => OK', function() {
		const instance = HostAndPort.fromString('example.com');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('example.com');
		expect(instance.port).toEqual(0);
	});

	it('fromString(example.com:80) => OK', function() {
		const instance = HostAndPort.fromString('example.com:80');
		if(! instance) {
			fail();
			return;
		}

		expect(instance.host).toEqual('example.com');
		expect(instance.port).toEqual(80);
	});
});
