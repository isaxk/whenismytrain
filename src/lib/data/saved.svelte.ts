import { browser } from '$app/environment';
import { distance } from '$lib/utils';
import AllStationsJSON from 'uk-railway-stations';

export class LocalStore<T> {
	value = $state<T>() as T;
	key = '';

	constructor(key: string, value: T) {
		this.key = key;
		this.value = value;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) this.value = this.deserialize(item);
		}

		$effect.root(() => {
			$effect(() => {
				localStorage.setItem(this.key, this.serialize(this.value));
			});
			return () => {};
		});
	}

	serialize(value: T): string {
		return JSON.stringify(value);
	}

	deserialize(item: string): T {
		return JSON.parse(item);
	}
}

export function localStore<T>(key: string, value: T) {
	return new LocalStore(key, value);
}

type SavedBoard = {
	from: string;
	to: string | null;
	time: string | null;
	key: string;
	type: 'dept' | 'arr';
};

export const savedBoards = localStore<SavedBoard[]>('saved-boards', []);
export const savedServices = localStore<{ crs: string; id: string; key: string }[]>(
	'saved-services',
	[]
);

export const coordsStore = localStore<{ lat: number; lng: number } | null>('coords', null);

export function getGeoStations() {
	if (coordsStore.value !== null) {
		const withDistance = AllStationsJSON.map((s) => {
			return {
				...s,
				distance: distance(coordsStore.value!.lat, coordsStore.value!.lng, s.lat, s.long, 'K')
			};
		});
		return withDistance.toSorted((a, b) => a.distance - b.distance);
	} else {
		return [];
	}
}

export function updateLocation() {
	navigator.geolocation.getCurrentPosition((t) => {
		coordsStore.value = { lat: t.coords.latitude, lng: t.coords.longitude };
	});
}
