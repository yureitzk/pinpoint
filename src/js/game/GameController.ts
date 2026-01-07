import { CANVAS } from '../core/canvas';
import {
	COLORS,
	SCORING,
	PLACEHOLDER_TEXT,
	THRESHOLD_FALLBACK,
	TIMING,
} from '../lib/constants';
import CoordinateSystem from '../core/CoordinateSystem';
import { state } from '../core/state';
import { dom } from '../ui/dom';
import Renderer from '../rendering/Renderer';
import { centroid, sortByAngle, getColors } from '../lib/utils';
import PatternGenerator from './PatternGenerator';
import ScoringEngine from './ScoringEngine';

class GameController {
	private renderer: Renderer;

	constructor(renderer: Renderer) {
		this.renderer = renderer;
	}

	startRound(): void {
		this.updateStateFromUI();
		this.resetRoundState();
		this.updateUiFromState();
		this.generateNewPattern();
		this.setupMemoryMode();
		this.draw();
	}

	resetStats(): void {
		state.currentStreak = 0;
		state.results = [];
		state.userClicks = [];
		state.normalizedUserClicks = [];
		state.comparisonShape = [];
		state.normalizedComparisonShape = [];
		state.isGameActive = false;

		this.resetUIState();
		this.updateStats();
		this.updateUiFromState();
		this.renderer.clear();
	}

	endRound(): void {
		state.isGameActive = false;
		state.isTargetVisible = true;
		state.isCopyAreaHidden = false;

		if (state.userClicks.length !== state.pointsType) {
			this.handleIncompleteRound();
			return;
		}

		this.processCompleteRound();
	}

	draw(): void {
		this.renderer.clear();

		if (state.targetPoints.length === 0) {
			return;
		}

		if (state.isMenuOpened && !state.isGameActive) {
			return;
		}

		this.drawDivider();
		this.drawTargetPattern();
		this.hideCopyArea();
		this.drawUserInteraction();
		this.drawIdealPlacement();
	}

	private updateUndoButton(): void {
		dom.undoButton.disabled =
			state.userClicks.length === 0 || !state.isGameActive;
	}

	public toggleAlignmentGuides(isEnabled: boolean): void {
		state.areAlignmentGuidesEnabled = isEnabled;
		this.handleUIFeatureToggle();
	}

	public toggleGhostLine(isEnabled: boolean): void {
		state.isGhostLineEnabled = isEnabled;
		this.handleUIFeatureToggle();
	}

	private updateCanvasTouchMode(): void {
		const needsPointerTracking =
			state.areAlignmentGuidesEnabled || state.isGhostLineEnabled;
		const shouldLock = state.isGameActive && needsPointerTracking;

		dom.canvas.style.touchAction = shouldLock ? 'none' : 'auto';
	}

	private updateStartScreen(): void {
		dom.startScreen.classList.toggle('hidden', state.isGameActive);
		state.isMenuOpened = !state.isGameActive;
	}

	private updateUiFromState(): void {
		this.updateStartScreen();
		this.updateCanvasTouchMode();
	}

	private handleUIFeatureToggle(): void {
		this.updateCanvasTouchMode();
		if (state.isGameActive) {
			this.draw();
		}
	}

	private drawIdealPlacement(): void {
		if (!state.isGameActive && state.comparisonShape.length > 0) {
			this.renderer.drawComparisonShape(state.comparisonShape);
		}
	}

	private calculateComparisonShape(bestStartIndex: number): Point[] {
		let orderedUserClicks = state.userClicks;

		if (state.userClicks.length >= 3) {
			const center = centroid(state.userClicks);
			const sorted = sortByAngle(state.userClicks, center);

			if (state.isMirrorMode) {
				orderedUserClicks = sorted.reverse();
			} else {
				orderedUserClicks = sorted;
			}
		}

		return orderedUserClicks.map((_, i) => {
			const targetIndex = (bestStartIndex + i) % state.targetPoints.length;
			const target = state.targetPoints[targetIndex];

			if (state.isAbsoluteMode) {
				if (state.layoutMode === 'horizontal') {
					const tx = state.isMirrorMode
						? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.x)
						: target.x + CANVAS.DIVIDER;
					return { x: tx, y: target.y };
				} else {
					const ty = state.isMirrorMode
						? CANVAS.DIVIDER + (CANVAS.DIVIDER - target.y)
						: target.y + CANVAS.DIVIDER;
					return { x: target.x, y: ty };
				}
			} else {
				const refTarget = state.targetPoints[0];
				const refUser = orderedUserClicks[bestStartIndex];

				let dx = target.x - refTarget.x;
				let dy = target.y - refTarget.y;

				if (state.isMirrorMode) {
					if (state.layoutMode === 'horizontal') {
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
		});
	}

	private drawDivider(): void {
		if (state.layoutMode === 'horizontal') {
			this.renderer.drawLines(
				[
					{ x: CANVAS.DIVIDER, y: 0 },
					{ x: CANVAS.DIVIDER, y: CANVAS.HEIGHT },
				],
				COLORS.DIVIDER,
			);
		} else {
			this.renderer.drawLines(
				[
					{ x: 0, y: CANVAS.DIVIDER },
					{ x: CANVAS.WIDTH, y: CANVAS.DIVIDER },
				],
				COLORS.DIVIDER,
			);
		}
	}

	private updateStateFromUI(): void {
		state.pointsType = parseInt(dom.pointsSelect.value);
		state.isMirrorMode = dom.mirrorCheckbox.checked;
		state.isAbsoluteMode = dom.absoluteCheckbox.checked;
		state.isMemoryMode = dom.memoryCheckbox.checked;
		state.isGhostLineEnabled = dom.ghostLineCheckbox.checked;
	}

	private resetRoundState(): void {
		state.userClicks = [];
		state.normalizedUserClicks = [];
		state.comparisonShape = [];
		state.isGameActive = true;
		state.isTargetVisible = true;
		state.isCopyAreaHidden = state.isMemoryMode;
		this.resetUIState();
	}

	private resetUIState(): void {
		dom.scoreSpan.textContent = PLACEHOLDER_TEXT.SCORE_SPAN;
		dom.scoreSpan.style.color = COLORS.TEXT_FALLBACK;
		dom.angleErrorSpan.textContent = PLACEHOLDER_TEXT.ANGLE_ERROR_SPAN;
		dom.angleErrorSpan.style.color = COLORS.TEXT_FALLBACK;
		dom.streakSpan.textContent = PLACEHOLDER_TEXT.STREAK_SPAN;
		this.updateUndoButton();
	}

	private generateNewPattern(): void {
		state.targetPoints = PatternGenerator.generate(state.pointsType);
	}

	private drawTargetPattern(): void {
		const shouldShow =
			!state.isGameActive || !state.isMemoryMode || state.isTargetVisible;
		if (!shouldShow || state.targetPoints.length === 0) return;

		this.renderer.drawLines(state.targetPoints, COLORS.TARGET_DEFAULT, {
			closed: true,
		});
		state.targetPoints.forEach((p, index) => {
			const isReference = index === 0 && !state.isAbsoluteMode;
			this.renderer.drawPoint(p.x, p.y, COLORS.TARGET_DEFAULT, false, isReference);
		});
	}

	private setupMemoryMode(): void {
		if (!state.isMemoryMode) return;

		const targetVisibilityMs =
			parseInt(dom.targetVisibilityDuration.value) || TIMING.TARGET_VISIBILITY_MS;
		const copyAreaMaskMs =
			parseInt(dom.copyAreaHiddenDuration.value) || TIMING.COPY_AREA_MASK_MS;

		setTimeout(() => {
			state.isTargetVisible = false;
			this.draw();
		}, targetVisibilityMs);

		setTimeout(() => {
			state.isCopyAreaHidden = false;
			this.draw();
		}, copyAreaMaskMs);
	}

	private hideCopyArea(): void {
		if (state.isGameActive && state.isMemoryMode && state.isCopyAreaHidden) {
			this.renderer.drawMask(PLACEHOLDER_TEXT.MASK);
		}
	}

	private drawUserInteraction(): void {
		if (state.isGameActive && state.isMemoryMode && state.isCopyAreaHidden)
			return;

		this.drawCrosshairIfNeeded();
		this.drawUserLines();
		this.drawGhostLineIfNeeded();
		this.drawUserPoints();
	}

	private drawCrosshairIfNeeded(): void {
		if (state.isGameActive && state.areAlignmentGuidesEnabled) {
			this.renderer.drawCrosshair(state.mousePosition.x, state.mousePosition.y);
		}
	}

	private handleIncompleteRound(): void {
		state.results.push({ accuracy: SCORING.ERROR_FOR_FAILED_ATTEMPT });
		state.currentStreak = 0;
		this.updateStats();
		this.draw();
	}

	private drawUserLines(): void {
		if (state.userClicks.length < 2) return;

		const color =
			state.isGameActive && state.userClicks.length < state.pointsType
				? COLORS.USER_LINES_PROGRESS
				: COLORS.USER_LINES_FINAL;

		this.renderer.drawLines(state.userClicks, color, {
			closed: !state.isGameActive,
		});
	}

	private drawGhostLineIfNeeded(): void {
		const shouldShow =
			state.isGameActive &&
			state.isGhostLineEnabled &&
			state.userClicks.length > 0 &&
			state.userClicks.length < state.pointsType;

		if (shouldShow) {
			const lastPoint = state.userClicks[state.userClicks.length - 1];
			this.renderer.drawGhostLine(lastPoint, state.mousePosition);
		}
	}

	private drawUserPoints(): void {
		const color =
			state.isGameActive && state.userClicks.length < state.pointsType
				? COLORS.USER_POINTS_PROGRESS
				: COLORS.USER_POINTS_FINAL;

		state.userClicks.forEach((p) => this.renderer.drawPoint(p.x, p.y, color));
	}

	handleClick(canvasX: number, canvasY: number): void {
		if (!this.canAcceptClick(canvasX, canvasY)) return;

		const point = { x: canvasX, y: canvasY };
		state.userClicks.push(point);

		const normalizedPoint = CoordinateSystem.toNormalized(
			point,
			state.layoutMode,
			CANVAS.WIDTH,
			CANVAS.HEIGHT,
			false,
		);
		if (!state.normalizedUserClicks) state.normalizedUserClicks = [];
		state.normalizedUserClicks.push(normalizedPoint);

		this.updateUndoButton();
		this.draw();

		if (state.userClicks.length === state.pointsType) {
			this.endRound();
		}
	}

	undoLastClick(): void {
		if (!state.isGameActive || state.userClicks.length === 0) return;

		state.userClicks.pop();
		state.normalizedUserClicks.pop();

		this.updateUndoButton();
		this.draw();
	}

	private canAcceptClick(x: number, y: number): boolean {
		const isMaskBlocking =
			state.isGameActive && state.isMemoryMode && state.isCopyAreaHidden;

		if (!state.isGameActive || isMaskBlocking) return false;

		if (state.layoutMode === 'horizontal') {
			return x >= CANVAS.DIVIDER;
		} else {
			return y >= CANVAS.DIVIDER;
		}
	}

	private processCompleteRound(): void {
		const score = ScoringEngine.calculateScore(
			state.targetPoints,
			state.userClicks,
			state.isMirrorMode,
			state.isAbsoluteMode,
		);

		state.comparisonShape = this.calculateComparisonShape(score.bestStartIndex);

		state.normalizedComparisonShape = state.comparisonShape.map((p) =>
			CoordinateSystem.toNormalized(
				p,
				state.layoutMode,
				dom.canvas.clientWidth,
				dom.canvas.clientHeight,
				false,
			),
		);

		state.results.push({ accuracy: score.distanceScore });
		dom.angleErrorSpan.textContent = score.angleErrors;
		dom.angleErrorSpan.style.color =
			getColors(
				[
					{ color: COLORS.PRECISION_LOW, value: 15 },
					{ color: COLORS.PRECISION_MEDIUM, value: 10 },
					{ color: COLORS.PRECISION_HIGH, value: 5 },
					{ color: COLORS.PRECISION_FULL, value: 0 },
				],
				Number.parseFloat(score.angleErrors),
			) || COLORS.TEXT_FALLBACK;

		dom.scoreSpan.textContent = `${score.percentage}`;
		dom.scoreSpan.style.color =
			getColors(
				[
					{ color: COLORS.PRECISION_FULL, value: 85 },
					{ color: COLORS.PRECISION_HIGH, value: 70 },
					{ color: COLORS.PRECISION_MEDIUM, value: 50 },
					{ color: COLORS.PRECISION_LOW, value: 0 },
				],
				score.percentage,
			) || COLORS.TEXT_FALLBACK;

		this.updateUndoButton();
		this.updateStreak(score.percentage);
		this.updateStats();
		this.draw();
	}

	private updateOverallStats(): void {
		const attempts = state.results.length;

		if (attempts === 0) {
			dom.progressBar.style.width = '0%';
			dom.attemptsDisplay.textContent = `0 ${PLACEHOLDER_TEXT.ATTEMPTS_DISPLAY_MANY}`;
			dom.averagePercentage.textContent = `${PLACEHOLDER_TEXT.AVERAGE_PERCENTAGE}`;
			return;
		}

		dom.attemptsDisplay.textContent = `${attempts} ${attempts > 1 ? PLACEHOLDER_TEXT.ATTEMPTS_DISPLAY_MANY : PLACEHOLDER_TEXT.ATTEMPTS_DISPLAY_ONE}`;

		const totalError = state.results.reduce(
			(sum, result) => sum + result.accuracy,
			0,
		);
		const overallAverageError = totalError / attempts;
		const precisionFraction =
			1 -
			Math.min(overallAverageError, SCORING.MAX_ERROR_TO_DISPLAY) /
				SCORING.MAX_ERROR_TO_DISPLAY;
		const precisionPercentage = Math.round(precisionFraction * 100);

		dom.averagePercentage.textContent = `${precisionPercentage}%`;
		dom.progressBar.style.width = `${precisionPercentage}%`;

		dom.progressBar.style.backgroundColor =
			getColors(
				[
					{ color: COLORS.PRECISION_FULL, value: 85 },
					{ color: COLORS.PRECISION_HIGH, value: 70 },
					{ color: COLORS.PRECISION_MEDIUM, value: 50 },
					{ color: COLORS.PRECISION_LOW, value: 0 },
				],
				precisionPercentage,
			) || COLORS.PROGRESS_BAR_FALLBACK;
	}

	private updateStreak(percentage: number): void {
		const threshold =
			parseInt(dom.passThresholdInput.value) || THRESHOLD_FALLBACK;
		state.currentStreak = percentage >= threshold ? state.currentStreak + 1 : 0;
	}

	updateStats(): void {
		dom.streakSpan.textContent =
			state.currentStreak > 0
				? state.currentStreak.toString()
				: PLACEHOLDER_TEXT.STREAK_SPAN;

		const avgError =
			state.results.reduce((sum, r) => sum + r.accuracy, 0) / state.results.length;
		const precisionFraction =
			1 -
			Math.min(avgError, SCORING.MAX_ERROR_TO_DISPLAY) /
				SCORING.MAX_ERROR_TO_DISPLAY;
		const percentage = Math.round(precisionFraction * 100);

		this.updateOverallStats();

		dom.progressBar.style.width = `${percentage}%`;
	}
}

export default GameController;
