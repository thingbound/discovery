import { BasicServiceDiscovery } from './internal';
import { Service } from '../service';

/**
 * Options available when creating an expiring discovery.
 */
export interface ExpiringDiscoveryOptions {
	/**
	 * The number of milliseconds a service remains discovered without any
	 * updates.
	 */
	maxStaleTime: number;
}

class TimerNode {
	public expiration: number;

	public readonly id: string;

	public next: this;
	public previous: this;

	constructor(id: string, maxStaleTime: number) {
		this.id = id;
		this.expiration = Date.now() + maxStaleTime;

		this.previous = this;
		this.next = this;
	}

	public updateExpiration(maxStaleNumber: number) {
		this.expiration = Date.now() + maxStaleNumber;
	}

	public remove() {
		this.previous.next = this.next;
		this.next.previous = this.previous;
		this.next = this.previous = this;
	}

	public appendToTail(head: this) {
		const tail = head.previous;
		head.previous = this;
		tail.next = this;
		this.next = head;
		this.previous = tail;
	}

	public moveToTail(head: this) {
		this.remove();
		this.appendToTail(head);
	}
}

/**
 * Discovery implementation that supports expiring services after a certain
 * amount of time.
 */
export abstract class ExpiringServiceDiscovery<S extends Service> extends BasicServiceDiscovery<S> {
	public readonly maxStaleTime: number;

	private readonly timerHead: TimerNode;
	private readonly timerMap: Map<string, TimerNode>;

	private expirationTimer: any;
	private nextExpiration?: number;

	constructor(type: string, options: ExpiringDiscoveryOptions) {
		if(! options) {
			throw new Error('options must be specified');
		}

		if(! options.maxStaleTime || options.maxStaleTime <= 0) {
			throw new Error('maxStaleTime option is required and needs to be a positive number');
		}

		super(type);

		this.maxStaleTime = options.maxStaleTime;

		this.timerHead = new TimerNode('', 0);
		this.timerMap = new Map();
	}

	protected updateService(service: S) {
		const result = super.updateService(service);

		let node = this.timerMap.get(service.id);
		if(node) {
			node.updateExpiration(this.maxStaleTime);
			node.moveToTail(this.timerHead);
		} else {
			node = new TimerNode(service.id, this.maxStaleTime);
			node.appendToTail(this.timerHead);
			this.timerMap.set(service.id, node);
		}

		this.rescheduleExpirer();

		return result;
	}

	protected removeService(service: S | string, skipRescheduling?: boolean) {
		const result = super.removeService(service);

		if(result) {
			// The service was removed, check if it's in the timer map
			const node = this.timerMap.get(result.id);
			if(node) {
				node.remove();
				this.timerMap.delete(result.id);

				if(! skipRescheduling) {
					this.rescheduleExpirer();
				}
			}
		}

		return result;
	}

	/**
	 * Reschedule the expiration timeout to the closest expiration.
	 */
	private rescheduleExpirer() {
		const node = this.timerHead.next;
		if(node === this.timerHead || node.expiration === this.nextExpiration) {
			// If there are no services or if the timer is already set to the current expiration time
			return;
		}

		if(this.expirationTimer) {
			// Clear the current timeout
			clearTimeout(this.expirationTimer);
		}

		// Update when the next expiration occurs and then calculate the delay until the clean up occurs
		this.nextExpiration = node.expiration;
		const delay = Math.max(0, this.nextExpiration - Date.now());

		this.expirationTimer = setTimeout(() => {
			this.removeExpiredNodes();

			// Clear and reset the timeout
			this.expirationTimer = undefined;
			this.nextExpiration = 0;
		}, delay);
	}

	private removeExpiredNodes() {
		const now = Date.now();
		while(this.timerHead.next !== this.timerHead && this.timerHead.expiration <= now) {
			this.removeService(this.timerHead.next.id, true);
		}

		this.rescheduleExpirer();
	}

	public async destroy(): Promise<void> {
		clearTimeout(this.expirationTimer);

		this.nextExpiration = 0;
		this.expirationTimer = undefined;

		await super.destroy();
	}
}
