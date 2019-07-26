import { v6 } from 'ip-regex';

const IPv6 = v6({exact: true});

/**
 * Representation of a host and a port. Supports some basic parsing via
 * `fromString(input)` supporting values such as `example.com`, `example.com:80`
 * `10.0.0.1`, `10.0.0.1:80`, `2001:db8::1` or `[2001:db8::1]:80`.
 */
export class HostAndPort {
	public readonly host: string;
	public readonly port: number;

	constructor(host: string, port: number) {
		this.host = host;
		this.port = port;
	}

	get hasPort() {
		return this.port >= 0;
	}

	/**
	 * Create an instance from a string.
	 *
	 * @param input
	 */
	public static fromString(input: string): HostAndPort | null {
		input = input.trim();

		if(input[0] === '[') {
			// Assume IPv6
			const closingBracket = input.lastIndexOf(']');
			if(closingBracket <= 0) {
				// No closing bracket, invalid
				return null;
			}

			const address = input.substring(1, closingBracket);
			if(! IPv6.test(address)) {
				return null;
			}

			/*
			 * In the case of brackets, either the input ends after or its
			 * followed by a colon and a port number.
			 */
			if(input.length === closingBracket + 1) {
				return new HostAndPort(address, 0);
			} else if(input[closingBracket + 1] === ':') {
				const portString = input.substring(closingBracket + 2);
				const port = parseInt(portString, 10);

				return new HostAndPort(address, port);
			} else {
				// Invalid host and port
				return null;
			}
		} else {
			const lastColon = input.lastIndexOf(':');
			const hasMultipleColons = input.indexOf(':') !== lastColon;

			if(hasMultipleColons) {
				// If the input has multiple colons it should be an IPv6 address
				if(! IPv6.test(input)) {
					return null;
				}

				return new HostAndPort(input, 0);
			}

			const address = lastColon >= 0 ? input.substring(0, lastColon) : input;

			let port = 0;
			if(lastColon >= 0) {
				const portString = input.substring(lastColon + 1);
				port = parseInt(portString, 10);
			}

			return new HostAndPort(address, port);
		}
	}

	public static compare(a: HostAndPort, b: HostAndPort): number {
		if(a.host < b.host) {
			return -1;
		}

		if(a.host > b.host) {
			return 1;
		}

		return a.port < b.port ? -1 : (a.port === b.port ? 0 : 1);
	}
}
