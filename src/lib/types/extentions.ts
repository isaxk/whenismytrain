import type { definitions } from './api';

export type ServiceDetailsLocation = {
	order: 'previous' | 'focus' | 'subsequent';
	crs: string;
	name: string;
	st: string;
	at: string;
	et: string;
	isCancelled: boolean;
};

export type ServiceDetailsWithID = definitions['ServiceDetails']
	& {
		locations: ServiceDetailsLocation[]
		serviceID: string;
		lastToBePast: ServiceDetailsLocation,
		destination: ServiceDetailsLocation,
		focus: ServiceDetailsLocation
	};
