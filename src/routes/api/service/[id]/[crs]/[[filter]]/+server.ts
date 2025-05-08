import dayjs from 'dayjs';
import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import type { CallingPoint, Location, ServiceDetails } from '$lib/types/train';
import { PUBLIC_QUERY_SERVICES_KEY, PUBLIC_REFERENCE_DATA_KEY } from '$env/static/public';
import { Position } from '$lib/types';
import type { TrainFilter } from '$lib/types/board';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import tiplocsData from '$lib/data/tiplocs.json';

dayjs.extend(utc);
dayjs.extend(timezone);

// I'll be completely honest, claude wrote most of this file. Merging and joining trains are not pleasent.

export const GET: RequestHandler = async ({ params }) => {
	const { id, crs, filter: filterMaybe } = params;
	console.log(`Processing service ${id} from ${crs} to ${filterMaybe}`);

	// Main service fetch
	const url = `https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${id}`;

	const response = await fetch(url, {
		headers: {
			'x-apikey': PUBLIC_QUERY_SERVICES_KEY
		}
	});
	const data = await response.json();
	if (!data) return error(404, 'Service not found');

	// Fetch tiploc data
	const tiplocResponse = await fetch('https://json-993.pages.dev/tiploc.json');
	const tiplocData = (await tiplocResponse.json()).Tiplocs;

	let tiplocs = tiplocsData
		.filter((t) => data.locations.some((l) => l.tiploc === t.tiploc))
		.map((t) => ({
			tiploc: t.tiploc,
			coords: [t.longitude, t.latitude]
		}));

	// Function to parse a location into our format
	async function parseLocation(l, i, allLocations) {
		let trainRelativePosition = Position.AWAY;

		if (l.isCancelled) {
			trainRelativePosition = Position.CANCELLED;
		} else if (l.atdSpecified) {
			trainRelativePosition = Position.DEPARTED;
		} else if (l.ataSpecified) {
			trainRelativePosition = Position.ARRIVED;
		}

		// Division info will be filled in later
		let division = null;
		let formedFrom = null;
		let divisionType = null;
		let divisionCallingPoints = null;

		// Check for formation associations
		if (l.associations) {
			const formationAssoc = l.associations.find(
				(a) => a.category === 'divide' || a.category === 'join'
			);

			// Check for "formed from" information (not the main division/join processing)
			if (
				formationAssoc &&
				((formationAssoc.category === 'divide' && formationAssoc.originCRS !== l.crs) ||
					(formationAssoc.category === 'join' && formationAssoc.destinationCRS !== l.crs))
			) {
				formedFrom = {
					id: formationAssoc.rid,
					origin: {
						crs: formationAssoc.originCRS,
						name: formationAssoc.origin
					},
					destination: {
						crs: formationAssoc.destinationCRS,
						name: formationAssoc.destination
					}
				};
			}
		}

		// Calculate progress
		const now = dayjs();
		const next = allLocations[i + 1] ?? null;
		const currentDeparture = l.atd ?? l.etd ?? l.std ?? null;
		const nextTime =
			next?.ata ?? next?.eta ?? next?.sta ?? next?.atd ?? next?.etd ?? next?.std ?? next;
		let progress = 0;

		if (nextTime && currentDeparture) {
			const nextDayjs = dayjs.tz(nextTime, 'Europe/London').utc(false);
			const currentDayjs = dayjs.tz(currentDeparture, 'Europe/London').utc(false);
			const diff = nextDayjs.diff(currentDayjs, 'second');
			const elapsed = now.diff(currentDayjs, 'second');
			progress = Math.max(0, Math.min(0.95, elapsed / diff));
		}

		return {
			name: l.locationName?.replace('(Elizabeth line)', '') ?? '',
			crs: l.crs ?? null,
			tiploc: l.tiploc ?? null,
			coordinates: tiplocs.find((t) => t.tiploc === l.tiploc)?.coords ?? [0, 50],
			platform: l.platform ?? null,
			trainRelativePosition,
			times: {
				estimated: {
					arrival: l.ata ?? l.eta ?? null,
					departure: l.atd ?? l.etd ?? null
				},
				scheduled: {
					arrival: l.sta ?? null,
					departure: l.std ?? null
				}
			},
			isCancelled: l.isCancelled ?? false,
			isCallingPoint: l.crs && !(l.isPass ?? false),
			division,
			divisionType,
			divisionCallingPoints,
			formedFrom,
			progress
		};
	}

	// Initial parsing of main service locations
	let locations = await Promise.all(
		data.locations.map((l, i) => parseLocation(l, i, data.locations))
	);

	// Get user destination - either explicit or default to last station
	let filterCrs =
		filterMaybe != 'null' && filterMaybe
			? filterMaybe
			: locations.filter((l) => l.isCallingPoint).slice(-1)[0]?.crs;

	// Check if focus station is in the main service
	let focusInMain = locations.some((l) => l.crs === crs);
	console.log(`Focus station ${crs} in main service: ${focusInMain}`);

	// Get all calling points from the main service (before processing associations)
	let mainCallingPoints = locations.filter((l) => l.isCallingPoint);
	let mainDestination = mainCallingPoints[mainCallingPoints.length - 1]?.crs;
	console.log(`Main service destination: ${mainDestination}`);
	console.log(`Main service calling points: ${mainCallingPoints.map((cp) => cp.crs).join(', ')}`);

	// Variables to track ultimate destination for case 2c
	let ultimateDestinationCrs = null;
	let ultimateDestinationName = null;
	let stationsAfterJoin = [];

	// Gather all service associations for divisions and joins
	const serviceAssociations = [];
	for (const location of data.locations) {
		if (!location.associations) continue;

		for (const assoc of location.associations) {
			if (assoc.category === 'divide' || assoc.category === 'join') {
				serviceAssociations.push({
					type: assoc.category,
					rid: assoc.rid,
					tiploc: location.tiploc,
					crs: location.crs,
					location: location,
					destinationCRS: assoc.destinationCRS,
					destination: assoc.destination
				});

				// Log the association
				console.log(
					`Found ${assoc.category} association at ${location.crs || location.tiploc} with service ${assoc.rid}. Destination: ${assoc.destination} (${assoc.destinationCRS})`
				);
			}
		}
	}

	// Fetch and process all associated services
	const associatedServices = [];
	for (const assoc of serviceAssociations) {
		try {
			// Fetch the associated service
			const assocUrl = `https://api1.raildata.org.uk/1010-query-services-and-service-details1_0/LDBSVWS/api/20220120/GetServiceDetailsByRID/${assoc.rid}`;
			const assocResponse = await fetch(assocUrl, {
				headers: {
					'x-apikey': PUBLIC_QUERY_SERVICES_KEY
				}
			});
			const assocData = await assocResponse.json();

			if (!assocData) continue;

			// Add tiplocs for the associated service
			const assocTiplocs = tiplocsData
				.filter((t) => assocData.locations.some((l) => l.tiploc === t.tiploc))
				.map((t) => ({
					tiploc: t.tiploc,
					coords: [t.longitude, t.latitude]
				}));

			tiplocs = [...tiplocs, ...assocTiplocs];

			// Parse associated service locations
			const assocLocations = await Promise.all(
				assocData.locations.map((l, i) => parseLocation(l, i, assocData.locations))
			);

			// Get the calling points from this associated service
			const assocCallingPoints = assocLocations.filter((l) => l.isCallingPoint);
			console.log(
				`Associated service ${assoc.rid} calling points: ${assocCallingPoints.map((cp) => cp.crs).join(', ')}`
			);

			// Check if filter is in this associated service
			const filterInAssoc = assocCallingPoints.some((l) => l.crs === filterCrs);
			console.log(
				`Filter station ${filterCrs} in associated service ${assoc.rid}: ${filterInAssoc}`
			);

			// For join services, capture the ultimate destination for case 2c
			if (assoc.type === 'join') {
				const lastStation = assocCallingPoints[assocCallingPoints.length - 1];
				if (lastStation) {
					console.log(
						`Join service ultimate destination: ${lastStation.crs} (${lastStation.name})`
					);
					ultimateDestinationCrs = lastStation.crs;
					ultimateDestinationName = lastStation.name;

					// Find stations after the join
					const joinPoint = assoc.location;
					const joinPointIndexAssoc = assocLocations.findIndex(
						(l) => l.tiploc === joinPoint.tiploc
					);
					if (joinPointIndexAssoc >= 0) {
						const afterJoin = assocLocations.slice(joinPointIndexAssoc + 1);
						stationsAfterJoin = afterJoin.filter((l) => l.isCallingPoint);
						console.log(`Found ${stationsAfterJoin.length} stations after join point`);
					}
				}
			}

			// Add to our list of associated services
			associatedServices.push({
				assoc,
				locations: assocLocations,
				callingPoints: assocCallingPoints,
				data: assocData,
				hasFilter: filterInAssoc
			});
		} catch (error) {
			console.error('Error processing association:', error);
		}
	}

	// Special case handling - check for various scenarios
	let needsMerging = false;
	let mergedLocations = null;

	// Case 2a: Focus in main service, filter is main destination
	if (focusInMain && filterCrs === mainDestination) {
		console.log(`Case 2a detected: Focus in main service, filter is main destination`);
		// Use main service with division data

		// Add division data for any join points
		for (const assoc of associatedServices) {
			if (assoc.assoc.type === 'join') {
				const joinPoint = assoc.assoc.location;
				const joinPointIndex = locations.findIndex((l) => l.tiploc === joinPoint.tiploc);

				if (joinPointIndex >= 0) {
					// Add division data to the join point
					const joinPointInAssoc = assoc.locations.findIndex((l) => l.tiploc === joinPoint.tiploc);
					if (joinPointInAssoc >= 0) {
						const beforeJoin = assoc.locations.slice(0, joinPointInAssoc);
						const beforeJoinCalling = beforeJoin.filter((l) => l.isCallingPoint);

						locations[joinPointIndex].division = {
							locations: beforeJoin,
							callingPoints: beforeJoinCalling
						};
						locations[joinPointIndex].divisionType = 'join';
						locations[joinPointIndex].divisionCallingPoints = beforeJoinCalling;
					}
				}
			}
		}
	}
	// Case 2b: Focus in main service, filter is in associated service after join
	else if (focusInMain) {
		for (const assoc of associatedServices) {
			if (assoc.assoc.type === 'join' && assoc.hasFilter) {
				console.log(`Case 2b detected: Focus in main service, filter in joined service`);

				// Find join points in both services
				const joinPointMain = locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
				const joinPointAssoc = assoc.locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);

				if (joinPointMain >= 0 && joinPointAssoc >= 0) {
					// Merge: main up to join + associated after join
					mergedLocations = [
						...locations.slice(0, joinPointMain + 1),
						...assoc.locations.slice(joinPointAssoc + 1)
					];

					// Add division info to join point
					const joinIndex = mergedLocations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
					if (joinIndex >= 0) {
						// For case 2b, show the joining service (BOG to BAA) in division
						const assocBeforeJoin = assoc.locations.slice(0, joinPointAssoc);
						const assocBeforeJoinCalling = assocBeforeJoin.filter((l) => l.isCallingPoint);

						mergedLocations[joinIndex].division = {
							locations: assocBeforeJoin,
							callingPoints: assocBeforeJoinCalling
						};
						mergedLocations[joinIndex].divisionType = 'join';
						mergedLocations[joinIndex].divisionCallingPoints = assocBeforeJoinCalling;
					}

					needsMerging = true;

					// Skip case 2c processing for case 2b
					ultimateDestinationCrs = null;
					stationsAfterJoin = [];

					break;
				}
			}
		}

		// If not case 2b, check for case 1b: Focus in main service, filter in division service
		if (!needsMerging) {
			for (const assoc of associatedServices) {
				if (assoc.assoc.type === 'divide' && assoc.hasFilter) {
					console.log(`Case 1b detected: Focus in main, filter in division service`);

					// Find division points in both services
					const divPointMain = locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
					const divPointDiv = assoc.locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);

					if (divPointMain >= 0 && divPointDiv >= 0) {
						// Merge: main before divide + div after divide
						mergedLocations = [
							...locations.slice(0, divPointMain + 1),
							...assoc.locations.slice(divPointDiv + 1)
						];

						// Add division data to division point
						const divIndex = mergedLocations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
						if (divIndex >= 0) {
							const mainAfterDiv = locations.slice(divPointMain + 1);
							const mainAfterDivCalling = mainAfterDiv.filter((l) => l.isCallingPoint);

							mergedLocations[divIndex].division = {
								locations: mainAfterDiv,
								callingPoints: mainAfterDivCalling
							};
							mergedLocations[divIndex].divisionType = 'divide';
							mergedLocations[divIndex].divisionCallingPoints = mainAfterDivCalling;
						}

						needsMerging = true;
						break;
					}
				}
			}
		}
	}
	// Cases 2b and 2c when focus is in joining service
	else {
		for (const assoc of associatedServices) {
			// Check if focus is in this associated service
			const focusInAssoc = assoc.callingPoints.some((l) => l.crs === crs);

			if (focusInAssoc && assoc.assoc.type === 'join') {
				console.log(`Focus station ${crs} found in joining service ${assoc.assoc.rid}`);

				// Find join points in both services
				const joinPointMain = locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
				const joinPointAssoc = assoc.locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);

				if (joinPointMain >= 0 && joinPointAssoc >= 0) {
					// Check if filter is in main service after join or in associated service
					const filterInMainAfterJoin = locations
						.slice(joinPointMain)
						.some((l) => l.crs === filterCrs);
					const filterInAssoc = assoc.callingPoints.some((l) => l.crs === filterCrs);

					if (filterInMainAfterJoin) {
						console.log(`Case 2b detected: Focus in joining service, filter in main after join`);
					} else if (filterInAssoc) {
						console.log(`Case 2c detected: Focus and filter in joining service`);
					}

					if (filterInMainAfterJoin || filterInAssoc) {
						// For both cases, merge: assoc before join + main after join
						mergedLocations = [
							...assoc.locations.slice(0, joinPointAssoc),
							...locations.slice(joinPointMain)
						];

						// Add division data to join point
						const joinIndex = mergedLocations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);
						if (joinIndex >= 0) {
							const mainBeforeJoin = locations.slice(0, joinPointMain);
							const mainBeforeJoinCalling = mainBeforeJoin.filter((l) => l.isCallingPoint);

							mergedLocations[joinIndex].division = {
								locations: mainBeforeJoin,
								callingPoints: mainBeforeJoinCalling
							};
							mergedLocations[joinIndex].divisionType = 'join';
							mergedLocations[joinIndex].divisionCallingPoints = mainBeforeJoinCalling;
						}

						needsMerging = true;
						break;
					}
				}
			}
		}
	}

	// Apply merged locations if any merging was done
	if (needsMerging && mergedLocations) {
		console.log(`Applying merged service`);
		locations = mergedLocations;
	}
	// If no merging was needed, still add division data for display
	else if (!needsMerging) {
		console.log(`No special merging needed, adding division data only`);

		for (const assoc of associatedServices) {
			const junctionPoint = assoc.assoc.location;
			const junctionIndex = locations.findIndex((l) => l.tiploc === junctionPoint.tiploc);

			if (junctionIndex >= 0) {
				if (assoc.assoc.type === 'join') {
					// For joins, add the joined service before the join point
					const joinPointInAssoc = assoc.locations.findIndex(
						(l) => l.tiploc === junctionPoint.tiploc
					);
					if (joinPointInAssoc >= 0) {
						const beforeJoin = assoc.locations.slice(0, joinPointInAssoc);
						const beforeJoinCalling = beforeJoin.filter((l) => l.isCallingPoint);

						locations[junctionIndex].division = {
							locations: beforeJoin,
							callingPoints: beforeJoinCalling
						};
						locations[junctionIndex].divisionType = 'join';
						locations[junctionIndex].divisionCallingPoints = beforeJoinCalling;
					}
				} else if (assoc.assoc.type === 'divide') {
					// For divides, add the divided service after the divide point
					const divPointInAssoc = assoc.locations.findIndex(
						(l) => l.tiploc === junctionPoint.tiploc
					);
					if (divPointInAssoc >= 0) {
						const afterDivide = assoc.locations.slice(divPointInAssoc + 1);
						const afterDivideCalling = afterDivide.filter((l) => l.isCallingPoint);

						locations[junctionIndex].division = {
							locations: afterDivide,
							callingPoints: afterDivideCalling
						};
						locations[junctionIndex].divisionType = 'divide';
						locations[junctionIndex].divisionCallingPoints = afterDivideCalling;
					}
				}
			}
		}
	}

	// Get all calling points from the final merged services
	let callingPoints = locations.filter((l) => l.isCallingPoint);
	console.log('Final calling points:', callingPoints.map((cp) => cp.crs).join(', '));

	// Find focus and filter indices in the calling points
	let focusIndex = callingPoints.findIndex((l) => l.crs === crs);
	let filterIndex = callingPoints.findIndex((l) => l.crs === filterCrs);
	console.log(`Initial focus index: ${focusIndex}, filter index: ${filterIndex}`);

	// Check if we found both stations
	if (focusIndex < 0) {
		console.error(`Focus station ${crs} not found in final calling points`);
		return error(500, { message: 'Focus Station not found' });
	}

	// If filter is still not found, we need to handle that
	if (filterIndex < 0) {
		// If filter is a destination of one of the associated services, use the last calling point
		for (const assoc of associatedServices) {
			if (assoc.assoc.destinationCRS === filterCrs) {
				console.log(
					`Filter ${filterCrs} is the destination of an associated service. Using last calling point.`
				);
				filterIndex = callingPoints.length - 1;
				// Update the filter CRS to match the last calling point (since we couldn't find the actual filter)
				filterCrs = callingPoints[filterIndex].crs;
				break;
			}
		}

		// Last attempt - if filter is default destination and we didn't find it,
		// use the last calling point
		if (filterIndex < 0) {
			if (!filterMaybe) {
				console.log(`Using last calling point as filter since no specific filter was requested`);
				filterIndex = callingPoints.length - 1;
				// Update the filter CRS to match the last calling point
				filterCrs = callingPoints[filterIndex].crs;
			} else {
				console.error(
					`Filter station ${filterCrs} not found after all attempts. Available stations: ${callingPoints.map((cp) => cp.crs).join(', ')}`
				);
				return error(500, { message: 'Filter station not found' });
			}
		}
	}

	// Make sure filter is after focus
	if (filterIndex < focusIndex) {
		// Look for another instance of the filter after the focus
		const laterFilterIndex = callingPoints.findIndex(
			(l, i) => l.crs === filterCrs && i > focusIndex
		);
		if (laterFilterIndex >= 0) {
			filterIndex = laterFilterIndex;
			console.log(`Adjusted filter index to be after focus: ${filterIndex}`);
		}
	}

	// Find the last focus before filter for loop services
	if (filterIndex >= 0) {
		const lastFocusIndex = callingPoints.findLastIndex((l, i) => l.crs === crs && i < filterIndex);
		if (lastFocusIndex >= 0) {
			focusIndex = lastFocusIndex;
			console.log(`Using last occurrence of focus before filter: ${focusIndex}`);
		}
	}

	const focusLoc = callingPoints[focusIndex];
	const filterLoc = callingPoints[filterIndex];

	// Calculate duration and other details
	const focusDeparture = focusLoc.times.estimated.departure ?? focusLoc.times.scheduled.departure;
	const filterArrival = filterLoc.times.estimated.arrival ?? filterLoc.times.scheduled.arrival;

	let duration = 0;
	if (focusDeparture && filterArrival) {
		duration = dayjs(filterArrival).diff(dayjs(focusDeparture), 'minutes');
	}

	const hours = Math.floor(duration / 60);
	const minutes = duration % 60;

	const filterDetails = {
		crs: filterCrs,
		name: filterLoc.name,
		stops: filterIndex - focusIndex - 1,
		duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
		time: filterArrival
	};

	// Group calling points for response
	const previous = callingPoints.slice(0, focusIndex);
	const subsequent = callingPoints.slice(focusIndex + 1, filterIndex);
	let further = callingPoints.slice(filterIndex + 1);

	// If focus is at a division point, add "formed from" information
	for (const assoc of associatedServices) {
		if (assoc.assoc.type === 'divide' && assoc.assoc.crs === crs) {
			console.log(`Focus station is at a division point. Adding formed from information.`);

			// Find division point in associated service
			const divPointAssoc = assoc.locations.findIndex((l) => l.tiploc === assoc.assoc.tiploc);

			if (divPointAssoc >= 0) {
				// Get stations before the division
				const beforeDivide = assoc.locations.slice(0, divPointAssoc);
				const beforeDivideCalling = beforeDivide.filter((l) => l.isCallingPoint);

				// Add these stations to the "previous" list at the front
				previous.unshift(...beforeDivideCalling);

				// Add this information to the focus location
				const focusLocation = locations.find((l) => l.crs === crs);
				if (focusLocation) {
					focusLocation.formedFrom = {
						id: assoc.assoc.rid,
						origin: {
							crs: assoc.data.locationDetail?.crs,
							name: assoc.data.locationDetail?.locationName
						},
						destination: {
							crs: assoc.assoc.destinationCRS,
							name: assoc.assoc.destination
						},
						callingPoints: beforeDivideCalling
					};
				}

				console.log(`Added ${beforeDivideCalling.length} stations from service before division`);
				break;
			}
		}
	}

	// Check if we're in case 2c - using stations from main service before join
	// and we have information about stations after the join
	const isCase2c =
		focusInMain &&
		ultimateDestinationCrs &&
		stationsAfterJoin.length > 0 &&
		filterIndex < callingPoints.length - 1 &&
		!needsMerging; // Only run case 2c if we didn't already process case 2b

	// For case 2c, include the stations after join in the further list
	if (isCase2c) {
		console.log(
			`Case 2c detected with ultimate destination ${ultimateDestinationCrs}. Adding after-join stations to further list.`
		);
		// Find the join point
		const joinIndex = callingPoints.findIndex(
			(cp) => cp.divisionType === 'join' && cp.division && cp.division.callingPoints.length > 0
		);

		if (joinIndex >= 0 && joinIndex > filterIndex) {
			console.log(`Join point found at ${callingPoints[joinIndex].crs}`);
			// Add stations after join, EXCEPT the ultimate destination (which will be set separately)
			further = [...further, ...stationsAfterJoin.slice(0, -1)];
		}
	}

	// Determine destination - either last calling point or ultimate destination for case 2c
	let destination = callingPoints[callingPoints.length - 1] || filterLoc;

	// For case 2c, set the destination to the ultimate destination after join
	if (isCase2c && ultimateDestinationCrs && ultimateDestinationName) {
		if (stationsAfterJoin.length > 0) {
			destination = stationsAfterJoin[stationsAfterJoin.length - 1];
		} else {
			destination = {
				crs: ultimateDestinationCrs,
				name: ultimateDestinationName
			};
		}
		console.log(`Set destination to ${destination.crs} (${destination.name})`);
	}

	if (further.length > 0 && further[0].crs === destination.crs) {
		further = [];
	}

	let lateReason: string | null = null;
	let cancelReason: string | null = null;

	if (data.cancelReason || data.delayReason) {
		const url = `https://api1.raildata.org.uk/1010-reference-data1_0/LDBSVWS/api/ref/20211101/GetReasonCode/${data.cancelReason?.Value || data.delayReason?.Value}`;
		const reasonResponse = await fetch(url, {
			headers: {
				'x-apikey': PUBLIC_REFERENCE_DATA_KEY
			}
		});
		const reasonData = await reasonResponse.json();
		console.log(reasonData);
		lateReason = reasonData.lateReason;
		cancelReason = reasonData.cancReason;
	}

	const returnData: ServiceDetails = {
		uid: data.uid,
		sdd: data.sdd,
		locations,
		allCallingPoints: callingPoints,
		filterDetails,
		operator: data.operatorCode,
		grouped: {
			previous,
			focus: focusLoc,
			subsequent,
			filter: filterLoc,
			further,
			destination
		},
		lateReason,
		cancelReason,
		genAt: new Date().toISOString()
	};

	return json(returnData);
};
