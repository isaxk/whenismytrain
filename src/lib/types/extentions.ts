import type { definitions } from './api';

export type ServiceDetailsWithID = definitions['ServiceDetails'] & {
	serviceID: string;
};
