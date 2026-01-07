export function distanceSquared(p1: Point, p2: Point): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return dx * dx + dy * dy;
}

export function angle(p1: Point, p2: Point): number {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function centroid(points: Point[]): Point {
	const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), {
		x: 0,
		y: 0,
	});
	return { x: sum.x / points.length, y: sum.y / points.length };
}

export function normalizeAngleDifference(diff: number): number {
	return diff > Math.PI ? 2 * Math.PI - diff : diff;
}

export function sortByAngle(points: Point[], center: Point): Point[] {
	return [...points].sort((a, b) => {
		const angleA = Math.atan2(a.y - center.y, a.x - center.x);
		const angleB = Math.atan2(b.y - center.y, b.x - center.x);
		return angleA - angleB;
	});
}

export function getLayoutMode(): LayoutMode {
	return window.innerWidth < 768 ? 'vertical' : 'horizontal';
}

export function getColors(
	colorObjects: ColorObject[],
	currentValue: number,
): string | undefined {
	const sortedArray = [...colorObjects.sort((a, b) => b.value - a.value)];

	for (let i = 0; i < sortedArray.length; i++) {
		const currentColorObject = colorObjects[i];

		if (currentValue >= currentColorObject.value) {
			return currentColorObject.color;
		}
	}

	return undefined;
}
