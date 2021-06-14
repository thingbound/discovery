import { Service } from '../src/Service';

export class TestService implements Service {
	public readonly id: string;
	public readonly data: any;

	constructor(id: string, data: any) {
		this.id = id;
		this.data = data;
	}
}
