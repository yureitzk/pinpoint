import { CANVAS } from '../core/canvas';
import { centroid, sortByAngle } from '../lib/mathUtils';

type ComparisonOptions = Pick<
	GameState,
	'layoutMode' | 'isMirrorMode' | 'isAbsoluteMode'
>;

export function calculateComparisonShape(
	userClicks: Point[],
	targetPoints: Point[],
	bestStartIndex: number,
	options: ComparisonOptions,
): Point[] {
	const { layoutMode, isMirrorMode, isAbsoluteMode } = options;

	let orderedUserClicks = userClicks;

	if (userClicks.length >= 3) {
		const center = centroid(userClicks);
		const sorted = sortByAngle(userClicks, center);
		orderedUserClicks = isMirrorMode ? sorted.reverse() : sorted;
	}

	return orderedUserClicks.map((_, i) => {
		const targetIndex = (bestStartIndex + i) % targetPoints.length;
		const target = targetPoints[targetIndex];

		if (isAbsoluteMode) {
			return calculateAbsolutePlacement(target, layoutMode, isMirrorMode);
		}

		return calculateRelativePlacement(
			target,
			targetPoints[0],
			orderedUserClicks[bestStartIndex],
			layoutMode,
			isMirrorMode,
		);
	});
}

function calculateAbsolutePlacement(
	target: Point,
	layoutMode: LayoutMode,
	isMirrorMode: boolean,
): Point {
	if (layoutMode === 'horizontal') {
		const x = isMirrorMode
			? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.x)
			: target.x + CANVAS.DIVIDER;

		return { x, y: target.y };
	}

	const y = isMirrorMode
		? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.y)
		: target.y + CANVAS.DIVIDER;

	return { x: target.x, y };
}

function calculateRelativePlacement(
	target: Point,
	refTarget: Point,
	refUser: Point,
	layoutMode: LayoutMode,
	isMirrorMode: boolean,
): Point {
	let dx = target.x - refTarget.x;
	let dy = target.y - refTarget.y;

	if (isMirrorMode) {
		if (layoutMode === 'horizontal') {
			dx = -dx;
		} else {
			dy = -dy;
		}
	}

	return {
		x: refUser.x + dx,
		y: refUser.y + dy,
	};
}

export function getLayoutMode(): LayoutMode {
	return window.innerWidth < 768 ? 'vertical' : 'horizontal';
}

