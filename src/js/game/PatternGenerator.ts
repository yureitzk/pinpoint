import { GEOMETRY } from '../lib/constants';
import { distanceSquared } from '../lib/mathUtils';

class PatternGenerator {
	static generate(numPoints: number, zoneSize: number): Point[] {
		const maxRadius = GEOMETRY.MAX_RADIUS;
		const minRadiusPx = GEOMETRY.MIN_RADIUS_PX;
		const maxDistortion = 0.08;

		const minRadius = Math.min(maxRadius, minRadiusPx / zoneSize);
		const radius = Math.random() * (maxRadius - minRadius) + minRadius;

		const startAngle = Math.random() * 2 * Math.PI;
		const angleIncrement = numPoints === 2 ? Math.PI : (2 * Math.PI) / numPoints;

		const points = Array.from({ length: numPoints }, (_, i) => {
			const angle = startAngle + i * angleIncrement;
			return {
				x: radius * Math.cos(angle) + (Math.random() - 0.5) * maxDistortion,
				y: radius * Math.sin(angle) + (Math.random() - 0.5) * maxDistortion,
			};
		});

		return this.reorderByClosestToOrigin(points);
	}

	private static reorderByClosestToOrigin(points: Point[]): Point[] {
		const closestIndex = points.reduce((minIdx, p, idx, arr) => {
			const dist = distanceSquared({ x: 0, y: 0 }, p);
			const minDist = distanceSquared({ x: 0, y: 0 }, arr[minIdx]);
			return dist < minDist ? idx : minIdx;
		}, 0);

		return points.map((_, i) => points[(closestIndex + i) % points.length]);
	}
}

export default PatternGenerator;
