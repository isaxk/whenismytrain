import dayjs from 'dayjs';

class Timeout {
	private id: number;
	public cleared: boolean;

	constructor(fn: () => void, interval: number) {
		this.id = setTimeout(fn, interval);
		this.cleared = false;
	}

	clear(): void {
		this.cleared = true;
		clearTimeout(this.id);
	}
}

let timeout: { cleared: boolean; clear: () => void };
export const refresherVals = $state({
	lastRefreshed: dayjs(),
	isRefreshing: false,
	interval: 10000
});

const callbacks: (() => Promise<void>)[] = $state([]);

async function refresh() {
	refresherVals.isRefreshing = true;
	await callbacks.forEach(async (callback) => await callback());
	setTimeout(() => {
		refresherVals.lastRefreshed = dayjs();
		refresherVals.isRefreshing = false;
		timeout = new Timeout(refresh, refresherVals.interval);
	}, 250);
}

export const refresher = {
	init: (interval: number) => {
		refresherVals.interval = interval;
		refresherVals.lastRefreshed = dayjs();
		timeout = new Timeout(refresh, interval);
	},
	clear: () => {
		timeout?.clear();
	},
	reset: () => {
		timeout?.clear();
		refresherVals.lastRefreshed = dayjs();
		timeout = new Timeout(refresh, refresherVals.interval);
	},
	add: (callback: () => void) => {
		const i = callback.length - 1;
		callbacks.push(callback);
		console.log(callbacks);
		return i;
	},
	remove: (i: number) => {
		callbacks.splice(i, 1);
	}
};

export function subscribeToTimeout(callback: () => void) {
	callbacks.push(callback);
}
