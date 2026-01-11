function getDOMElements() {
	const get = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;

	const canvas = get<HTMLCanvasElement>('canvas');

	return {
		canvas,
		ctx: canvas.getContext('2d')!,
		pointsSelect: get<HTMLSelectElement>('#points'),
		passThresholdInput: get<HTMLInputElement>('#passThreshold'),
		ghostLineCheckbox: get<HTMLInputElement>('#ghostLineOption'),
		mirrorCheckbox: get<HTMLInputElement>('#mirrorOption'),
		absoluteCheckbox: get<HTMLInputElement>('#absoluteOption'),
		memoryCheckbox: get<HTMLInputElement>('#memoryOption'),
		alignmentGuidesCheckbox: get<HTMLInputElement>('#alignmentGuidesOption'),
		startButton: get<HTMLButtonElement>('#startButton'),
		resetButton: get<HTMLButtonElement>('#resetButton'),
		scoreSpan: get<HTMLSpanElement>('#scoreValue'),
		angleErrorSpan: get<HTMLSpanElement>('#angleErrorValue'),
		streakSpan: get<HTMLSpanElement>('#streakValue'),
		progressBar: get<HTMLDivElement>('#progressBar'),
		attemptsDisplay: get<HTMLDivElement>('#attemptsDisplay'),
		averagePercentage: get<HTMLDivElement>('#averagePercentage'),
		targetVisibilityDuration: get<HTMLInputElement>('#targetVisibilityDuration'),
		copyAreaHiddenDuration: get<HTMLInputElement>('#copyAreaHiddenDuration'),
		startScreen: get<HTMLInputElement>('#startScreen'),
		helpButton: get<HTMLInputElement>('#helpButton'),
		undoButton: get<HTMLInputElement>('#undoButton'),
	} as const;
}

export const dom = getDOMElements();
