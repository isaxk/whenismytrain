import type { definitions } from './api';

type OriginDestination = {
	crs: string;
	name: string;
};

export enum Status {
	ARRIVED,
	DEPARTED,
	AWAY,
	STARTS_HERE
}

export type Board = {
	locationName: string;
	locationCrs: string;
	filterLocationName: string | null;
	filterCrs: string | null;
	type: 'dept' | 'arr';
	trains: TrainService[];
	alerts: definitions['NRCCMessage'][];
};

export type TrainService = {
	id: string;
	destination: OriginDestination;
	origin: OriginDestination;
	scheduled: string | null;
	actual: string | null;
	estimated: string | null;
	operator: string;
	platform: string;
	isCancelled: boolean;
	status: Status;
	cancelReason: definitions['ReasonCodeWithLocation'] | null;
};
