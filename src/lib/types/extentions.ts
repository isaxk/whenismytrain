import type { definitions } from './api';

export type ServiceDetailsLocation = {
	order: 'previous' | 'focus' | 'subsequent';
	state: 'far' | 'here' | 'gone';
	platform: string | null;
	crs: string;
	name: string;
	std?: string;
	sta?: string;
	atd?: string;
	ata?: string;
	etd?: string;
	eta?: string;
	isCancelled: boolean;
};

export type ServiceDetailsWithID = definitions['ServiceDetails'] & {
	locations: ServiceDetailsLocation[];
	serviceID: string;
	lastToBePast: ServiceDetailsLocation;
	destination: ServiceDetailsLocation;
	focus: ServiceDetailsLocation;
};
