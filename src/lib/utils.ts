import type { TrainService } from '$lib/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { definitions } from '$lib/types/api';

export function strToMins(t: string) {
	const s = t.split(':');
	return Number(s[0]) * 60 + Number(s[1]);
}

export function sortByLiveDepart([, a]: [string, TrainService], [, b]: [string, TrainService]) {
	const timeA = a.actual ?? a.estimated ?? a.scheduled;
	const timeB = b.actual ?? b.estimated ?? b.scheduled;
	if ((timeA ?? 0) < (timeB ?? 0)) return -1;
	else return 1;
}
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

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
