import type { Status } from '.';
import type { definitions } from './api';

export type ServiceDetailsLocation = {
	order: 'previous' | 'focus' | 'subsequent';
	state: Status;
	platform: string | null;
	crs: string;
	tiploc: string;
	name: string;
	std?: string;
	sta?: string;
	atd?: string;
	ata?: string;
	etd?: string;
	eta?: string;
	isPass: boolean;
	isCancelled: boolean;
};

export type ServiceDetailsWithID = definitions['ServiceDetails'] & {
	locations: ServiceDetailsLocation[];
	serviceID: string;
	lastToBePast: ServiceDetailsLocation;
	destination: ServiceDetailsLocation;
	focus: ServiceDetailsLocation;
};
