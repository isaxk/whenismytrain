import { navigating } from '$app/state';

const subscriptions: { api: string; callbacks: { key: string; fn: <T>(data: T) => void }[] }[] = [];

let timeout: ReturnType<typeof setTimeout>;

export const refreshing = $state({ value: false });

async function runRefresh(duration: number) {
	if (navigating.to) {
		await navigating.complete;
	}

	refreshing.value = true;

	setTimeout(async () => {
		await Promise.all(
			subscriptions.map(async (sub) => {
				const response = await fetch(sub.api);
				const data = await response.json();
				sub.callbacks.forEach((callback) => callback.fn(data));
			})
		);

		setTimeout(async () => {
			refreshing.value = false;
		}, 100);
		timeout = setTimeout(() => runRefresh(duration), duration);
	}, 200);
}

export const refresher = {
	init: (duration: number) => {
		timeout = setTimeout(() => runRefresh(duration), duration);
		return () => clearTimeout(timeout);
	},
	subscribe: <T>(api: string, key: string, callback: (data: T) => void) => {
		const existingSubscription = subscriptions.find((sub) => sub.api === api);
		if (existingSubscription) {
			existingSubscription.callbacks = existingSubscription.callbacks.filter(
				(cb) => cb.key !== key
			);
			existingSubscription.callbacks.push({ key, fn: callback as <T>(data: T) => void });
		} else {
			subscriptions.push({ api, callbacks: [{ key, fn: callback as <T>(data: T) => void }] });
		}
		const subscriptionIndex = subscriptions.findIndex((sub) => sub.api === api);
		return () => {
			const subscription = subscriptions[subscriptionIndex];
			if (subscription) {
				subscription.callbacks = subscription.callbacks.filter((cb) => cb.key !== key);
				if (subscription.callbacks.length === 0) {
					subscriptions.splice(subscriptionIndex, 1);
				}
			}
		};
	}
};
