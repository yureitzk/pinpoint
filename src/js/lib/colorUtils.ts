import { COLORS } from './constants';

export function getAngleErrorColor(angleError: number): string {
	return (
		getColors(
			[
				{ color: COLORS.PRECISION_LOW, value: 15 },
				{ color: COLORS.PRECISION_MEDIUM, value: 10 },
				{ color: COLORS.PRECISION_HIGH, value: 5 },
				{ color: COLORS.PRECISION_FULL, value: 0 },
			],
			angleError,
		) || COLORS.TEXT_FALLBACK
	);
}

export function getScoreColor(percentage: number): string {
	return (
		getColors(
			[
				{ color: COLORS.PRECISION_FULL, value: 85 },
				{ color: COLORS.PRECISION_HIGH, value: 70 },
				{ color: COLORS.PRECISION_MEDIUM, value: 50 },
				{ color: COLORS.PRECISION_LOW, value: 0 },
			],
			percentage,
		) || COLORS.TEXT_FALLBACK
	);
}

function getColors(
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
