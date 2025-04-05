import AllStationsJSON from '$lib/data/stations.json';
import { localStore } from './local-store.svelte';
import { distance } from '$lib/utils/fn';

export const coordsStore = localStore<{ lat: number; lng: number } | null>('coords', null);

export function getGeoStations() {
	if (coordsStore.value) {
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
		if (t.coords) {
			coordsStore.value = { lat: t.coords.latitude, lng: t.coords.longitude };
		}
	});
}
