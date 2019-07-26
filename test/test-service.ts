import { Service } from '../src/service';

export class TestService implements Service {
	public readonly id: string;
	public readonly data: any;

	constructor(id: string, data: any) {
		this.id = id;
		this.data = data;
	}
}
