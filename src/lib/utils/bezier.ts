export function smoothLine(points: [number, number][]) {
	const smoothing = 0.15;
	const options = {
		yMin: -10,
		yMax: 130,
		xMin: -5,
		xMax: 200
	};

	const line = (pointA, pointB) => {
		const lengthX = pointB[0] - pointA[0];
		const lengthY = pointB[1] - pointA[1];
		return {
			length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
			angle: Math.atan2(lengthY, lengthX)
		};
	};

	// Position of a control point
	// I:  - current (array) [x, y]: current point coordinates
	//     - previous (array) [x, y]: previous point coordinates
	//     - next (array) [x, y]: next point coordinates
	//     - reverse (boolean, optional): sets the direction
	// O:  - (array) [x,y]: a tuple of coordinates
	const controlPoint = (current, previous, next, reverse) => {
		// When 'current' is the first or last point of the array
		// 'previous' or 'next' don't exist.
		// Replace with 'current'
		const p = previous || current;
		const n = next || current;

		// Properties of the opposed-line
		const o = line(p, n);

		// If is end-control-point, add PI to the angle to go backward
		const angle = o.angle + (reverse ? Math.PI : 0);
		const length = o.length * smoothing;

		// The control point position is relative to the current point
		const x = current[0] + Math.cos(angle) * length;
		const y = current[1] + Math.sin(angle) * length;
		return [x, y];
	};

	const bezierCommand = (point, i, a) => {
		// start control point
		const cps = controlPoint(a[i - 1], a[i - 2], point, false);

		// end control point
		const cpe = controlPoint(point, a[i - 1], a[i + 1], true);

		return { cps, cpe, point };
	};

	points.reduce((acc, point, i, a) => {
		console.log(bezierCommand(point, i, a));
	});
}
