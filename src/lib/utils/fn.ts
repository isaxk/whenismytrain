import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const throttle = (fn: () => unknown, wait: number = 300) => {
	let inThrottle: boolean, lastFn: ReturnType<typeof setTimeout>, lastTime: number;
	return function (this: any) {
		const context = this,
			args = arguments;
		if (!inThrottle) {
			fn.apply(context, args);
			lastTime = Date.now();
			inThrottle = true;
		} else {
			clearTimeout(lastFn);
			lastFn = setTimeout(
				() => {
					if (Date.now() - lastTime >= wait) {
						fn.apply(context, args);
						lastTime = Date.now();
					}
				},
				Math.max(wait - (Date.now() - lastTime), 0)
			);
		}
	};
};

export function distance(lat1: number, lon1: number, lat2: number, lon2: number, unit: 'K' | 'N') {
	const radlat1 = (Math.PI * lat1) / 180;
	const radlat2 = (Math.PI * lat2) / 180;
	const theta = lon1 - lon2;
	const radtheta = (Math.PI * theta) / 180;
	let dist =
		Math.sin(radlat1) * Math.sin(radlat2) +
		Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	if (dist > 1) {
		dist = 1;
	}
	dist = Math.acos(dist);
	dist = (dist * 180) / Math.PI;
	dist = dist * 60 * 1.1515;
	if (unit == 'K') {
		dist = dist * 1.609344;
	}
	if (unit == 'N') {
		dist = dist * 0.8684;
	}
	return dist;
}

export function boardUrl(from: string, to: string | null, time: string | null) {
	const pathname = `/board/${from}`;
	const params = new URLSearchParams();
	if (to) {
		params.set('to', to);
	}
	if (time) {
		params.set('time', time.replace(':', ''));
	}

	return pathname + '?' + params.toString();
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
