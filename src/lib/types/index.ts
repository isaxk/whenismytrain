export type DestinationOrigin = {
	name: string;
	crs: string;
};

export type TimeObject = {
	estimated: {
		arrival: string;
		departure: string;
	};
	scheduled: {
		arrival: string;
		departure: string;
	};
};

export enum Position {
	AWAY,
	ARRIVED,
	DEPARTED,
	STARTS_HERE,
	CANCELLED,
	UNKNOWN
}
