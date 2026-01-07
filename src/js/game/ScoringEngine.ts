import { state } from '../core/state';
import { SCORING } from '../lib/constants';
import { CANVAS } from '../core/canvas';
import {
	angle,
	centroid,
	distanceSquared,
	normalizeAngleDifference,
	sortByAngle,
} from '../lib/mathUtils';

class ScoringEngine {
	static calculateScore(
		targetPoints: Point[],
		userClicks: Point[],
		isMirrorMode: boolean,
		isAbsoluteMode: boolean,
	): {
		distanceScore: number;
		angleErrors: string;
		percentage: number;
		bestStartIndex: number;
	} {
		const orderedUserClicks = this.orderUserPoints(userClicks);
		const { minError, bestStartIndex } = this.findBestAlignment(
			targetPoints,
			orderedUserClicks,
			isMirrorMode,
			isAbsoluteMode,
		);

		const angleError = this.calculateAngleError(
			targetPoints,
			orderedUserClicks,
			bestStartIndex,
			isMirrorMode,
		);

		const averageDistanceError = Math.round(
			Math.sqrt(minError / targetPoints.length),
		);
		const precisionFraction =
			1 -
			Math.min(averageDistanceError, SCORING.MAX_ERROR_TO_DISPLAY) /
				SCORING.MAX_ERROR_TO_DISPLAY;
		const percentage = Math.max(0, Math.round(precisionFraction * 100));

		return {
			distanceScore: averageDistanceError,
			angleErrors: angleError.toFixed(1),
			percentage,
			bestStartIndex,
		};
	}

	private static orderUserPoints(points: Point[]): Point[] {
		if (points.length < 3) return points;
		const center = centroid(points);
		const sorted = sortByAngle(points, center);

		if (state.isMirrorMode) {
			return sorted.reverse();
		}

		return sorted;
	}

	private static findBestAlignment(
		targetPoints: Point[],
		userPoints: Point[],
		isMirrorMode: boolean,
		isAbsoluteMode: boolean,
	): { minError: number; bestStartIndex: number } {
		// For relative mode with 3+ points, also try all alignments
		// because sorting changes the order
		const shouldTryAllOffsets = isAbsoluteMode || userPoints.length >= 3;

		if (!shouldTryAllOffsets) {
			const error = this.calculateAlignmentError(
				targetPoints,
				userPoints,
				0,
				isMirrorMode,
				isAbsoluteMode,
			);
			return { minError: error, bestStartIndex: 0 };
		}

		let minError = Infinity;
		let bestStartIndex = 0;

		for (let startOffset = 0; startOffset < targetPoints.length; startOffset++) {
			const error = this.calculateAlignmentError(
				targetPoints,
				userPoints,
				startOffset,
				isMirrorMode,
				isAbsoluteMode,
			);

			if (error < minError) {
				minError = error;
				bestStartIndex = startOffset;
			}
		}

		return { minError, bestStartIndex };
	}

	private static calculateAlignmentError(
		targetPoints: Point[],
		userPoints: Point[],
		startOffset: number,
		isMirrorMode: boolean,
		isAbsoluteMode: boolean,
	): number {
		let errorSquared = 0;

		for (let i = 0; i < targetPoints.length; i++) {
			const target = targetPoints[i];
			const user = userPoints[(startOffset + i) % userPoints.length];

			if (isAbsoluteMode) {
				if (state.layoutMode === 'horizontal') {
					const tx = isMirrorMode
						? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.x)
						: target.x + CANVAS.DIVIDER;

					errorSquared += distanceSquared({ x: tx, y: target.y }, user);
				} else {
					const ty = isMirrorMode
						? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.y)
						: target.y + CANVAS.DIVIDER;

					errorSquared += distanceSquared({ x: target.x, y: ty }, user);
				}
			} else {
				const refTarget = targetPoints[0];
				const refUser = userPoints[startOffset];

				let dx = target.x - refTarget.x;
				let dy = target.y - refTarget.y;

				if (isMirrorMode) {
					if (state.layoutMode === 'horizontal') {
						dx = -dx;
					} else {
						dy = -dy;
					}
				}

				const expected = {
					x: refUser.x + dx,
					y: refUser.y + dy,
				};

				errorSquared += distanceSquared(expected, user);
			}
		}

		return errorSquared;
	}

	private static calculateAngleError(
		targetPoints: Point[],
		userPoints: Point[],
		startIndex: number,
		isMirrorMode: boolean,
	): number {
		let totalError = 0;

		for (let i = 0; i < targetPoints.length; i++) {
			const t1 = targetPoints[i];
			const t2 = targetPoints[(i + 1) % targetPoints.length];
			const u1 = userPoints[(startIndex + i) % userPoints.length];
			const u2 = userPoints[(startIndex + i + 1) % userPoints.length];

			let targetAngle = angle(t1, t2);
			const userAngle = angle(u1, u2);

			if (isMirrorMode) {
				if (state.layoutMode === 'horizontal') {
					targetAngle = Math.atan2(t2.y - t1.y, -(t2.x - t1.x));
				} else {
					targetAngle = Math.atan2(-(t2.y - t1.y), t2.x - t1.x);
				}
			}

			const diff = normalizeAngleDifference(Math.abs(targetAngle - userAngle));
			totalError += (diff * 180) / Math.PI;
		}

		return totalError / targetPoints.length;
	}
}

export default ScoringEngine;
