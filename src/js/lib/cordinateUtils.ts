import CoordinateSystem from '../core/CoordinateSystem';

export class CoordinateConverter {
	private layoutMode: LayoutMode;
	private width: number;
	private height: number;

	constructor(layoutMode: LayoutMode, width: number, height: number) {
		this.layoutMode = layoutMode;
		this.width = width;
		this.height = height;
	}

	toPixels(point: Point, isTargetZone: boolean): Point {
		return CoordinateSystem.toPixels(
			point,
			this.layoutMode,
			this.width,
			this.height,
			isTargetZone,
		);
	}

	toNormalized(point: Point, isTargetZone: boolean): Point {
		return CoordinateSystem.toNormalized(
			point,
			this.layoutMode,
			this.width,
			this.height,
			isTargetZone,
		);
	}

	toPixelsArray(points: Point[], isTargetZone: boolean): Point[] {
		return points.map((p) => this.toPixels(p, isTargetZone));
	}

	toNormalizedArray(points: Point[], isTargetZone: boolean): Point[] {
		return points.map((p) => this.toNormalized(p, isTargetZone));
	}
}

export function createConverter(
	layoutMode: LayoutMode,
	canvas: HTMLCanvasElement,
): CoordinateConverter {
	return new CoordinateConverter(
		layoutMode,
		canvas.clientWidth,
		canvas.clientHeight,
	);
}
