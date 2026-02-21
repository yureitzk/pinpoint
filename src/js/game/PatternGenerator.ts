import { GEOMETRY } from '../lib/constants';
import { distanceSquared } from '../lib/mathUtils';

class PatternGenerator {
	static generate(numPoints: number, layoutMode: LayoutMode, width: number, height: number): Point[] {
		const isHorizontal = layoutMode === 'horizontal';
		const sectionWidth = isHorizontal ? width / 2 : width;
		const sectionHeight = isHorizontal ? height : height / 2;
		const zoneSize = Math.min(sectionWidth, sectionHeight);

		const minRelRadius = 0.15;
		const maxRelRadius = 0.35;

		const radiusScale = Math.random() * (maxRelRadius - minRelRadius) + minRelRadius;
		const radius = zoneSize * radiusScale;

		const centerX = isHorizontal ? width / 4 : width / 2;
		const centerY = isHorizontal ? height / 2 : height / 4;

		const startAngle = Math.random() * 2 * Math.PI;
		const angleIncrement = numPoints === 2 ? Math.PI : (2 * Math.PI) / numPoints;

		const points = Array.from({ length: numPoints }, (_, i) => {
			const angle = startAngle + i * angleIncrement;
			const idealX = centerX + radius * Math.cos(angle);
			const idealY = centerY + radius * Math.sin(angle);
			const distortionX = (Math.random() - 0.5) * GEOMETRY.MAX_DISTORTION;
			const distortionY = (Math.random() - 0.5) * GEOMETRY.MAX_DISTORTION;

			return {
				x: Math.round(idealX + distortionX),
				y: Math.round(idealY + distortionY),
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
