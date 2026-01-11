class CoordinateSystem {
	static getZone(layout: LayoutMode, width: number, height: number, isTargetZone: boolean) {
		const isHorizontal = layout === 'horizontal';

		const isFirstSection = isTargetZone;

		if (isHorizontal) {
			const sectionWidth = width / 2;
			return {
				centerX: isFirstSection ? sectionWidth / 2 : sectionWidth * 1.5,
				centerY: height / 2,
				size: Math.min(sectionWidth, height), // Use smallest dimension to maintain aspect ratio
			};
		} else {
			const sectionHeight = height / 2;
			return {
				centerX: width / 2,
				centerY: isFirstSection ? sectionHeight / 2 : sectionHeight * 1.5,
				size: Math.min(width, sectionHeight),
			};
		}
	}

	// Convert Normalized (-0.5 to 0.5) to Pixels
	static toPixels(normalized: Point, layout: LayoutMode, width: number, height: number, isTargetZone: boolean): Point {
		const zone = this.getZone(layout, width, height, isTargetZone);
		// Multiply by 0.85 to leave a little padding around the edges
		const scale = zone.size * 0.85;

		return {
			x: zone.centerX + normalized.x * scale,
			y: zone.centerY + normalized.y * scale,
		};
	}

	// Convert Pixels to Normalized (-0.5 to 0.5)
	static toNormalized(pixels: Point, layout: LayoutMode, width: number, height: number, isTargetZone: boolean): Point {
		const zone = this.getZone(layout, width, height, isTargetZone);
		const scale = zone.size * 0.85;

		return {
			x: (pixels.x - zone.centerX) / scale,
			y: (pixels.y - zone.centerY) / scale,
		};
	}
}

export default CoordinateSystem;
