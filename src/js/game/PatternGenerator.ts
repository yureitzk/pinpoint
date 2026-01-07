import { GEOMETRY } from '../lib/constants';
import { CANVAS } from '../core/canvas';
import CoordinateSystem from '../core/CoordinateSystem';
import { state } from '../core/state';
import { distanceSquared } from '../lib/utils';

class PatternGenerator {
	static generate(numPoints: number): Point[] {
		const radius =
			Math.random() * (GEOMETRY.MAX_RADIUS - GEOMETRY.MIN_RADIUS) +
			GEOMETRY.MIN_RADIUS;
		let centerX, centerY;

		if (state.layoutMode === 'horizontal') {
			centerX = CANVAS.WIDTH / 4;
			centerY = CANVAS.HEIGHT / 2;
		} else {
			centerX = CANVAS.WIDTH / 2;
			centerY = CANVAS.HEIGHT / 4;
		}

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

		const sortedPoints = this.reorderByClosestToOrigin(points);

		state.normalizedTargetPoints = sortedPoints.map((p) =>
			CoordinateSystem.toNormalized(
				p,
				state.layoutMode,
				CANVAS.WIDTH,
				CANVAS.HEIGHT,
				true,
			),
		);

		return sortedPoints;
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
