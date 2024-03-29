import { Service } from '../src/Service.js';

export class TestService implements Service {
	public readonly id: string;
	public readonly data: any;

	public constructor(id: string, data: any) {
		this.id = id;
		this.data = data;
	}
}
