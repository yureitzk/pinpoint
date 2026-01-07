import { CANVAS } from '../core/canvas';
import { COLORS, SCORING, PLACEHOLDER_TEXT } from '../lib/constants';
import { state } from '../core/state';
import Renderer from '../rendering/Renderer';
import PatternGenerator from './PatternGenerator';
import ScoringEngine from './ScoringEngine';
import UIManager from '../ui/UIManager';
import { calculateComparisonShape } from '../lib/gameUtils';
import { CoordinateConverter } from '../lib/cordinateUtils';

class GameController {
	private renderer: Renderer;
	private uiManager: UIManager;

	constructor(renderer: Renderer, uiManager: UIManager) {
		this.renderer = renderer;
		this.uiManager = uiManager;
	}

	public startRound(): void {
		this.syncUI();
		this.resetRoundState();
		this.updateUiFromState();
		this.generateNewPattern();
		this.setupMemoryMode();
		this.draw();
	}

	public endRound(): void {
		state.isGameActive = false;
		state.isTargetVisible = true;
		state.isCopyAreaHidden = false;

		if (state.userClicks.length !== state.pointsType) {
			this.handleIncompleteRound();
			return;
		}

		this.processCompleteRound();
	}

	public handleClick(canvasX: number, canvasY: number): void {
		if (!this.canAcceptClick(canvasX, canvasY)) return;

		const point = { x: canvasX, y: canvasY };
		state.userClicks.push(point);

		const converter = this.getConverter();
		const normalizedPoint = converter.toNormalized(point, false);

		if (!state.normalizedUserClicks) state.normalizedUserClicks = [];
		state.normalizedUserClicks.push(normalizedPoint);

		this.updateUndoButton();
		this.draw();

		if (state.userClicks.length === state.pointsType) {
			this.endRound();
		}
	}

	public undoLastClick(): void {
		if (!state.isGameActive || state.userClicks.length === 0) return;

		state.userClicks.pop();
		state.normalizedUserClicks.pop();

		this.updateUndoButton();
		this.draw();
	}

	public resetStats(): void {
		state.currentStreak = 0;
		state.results = [];
		state.userClicks = [];
		state.normalizedUserClicks = [];
		state.comparisonShape = [];
		state.normalizedComparisonShape = [];
		state.isGameActive = false;

		this.resetUIState();
		this.refreshUIStats();
		this.updateUiFromState();
		this.renderer.clear();
	}

	public draw(): void {
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

	public toggleAlignmentGuides(isEnabled: boolean): void {
		state.areAlignmentGuidesEnabled = isEnabled;
		this.handleUIFeatureToggle();
	}

	public toggleGhostLine(isEnabled: boolean): void {
		state.isGhostLineEnabled = isEnabled;
		this.handleUIFeatureToggle();
	}

	private updateUndoButton(): void {
		this.uiManager.setUndoDisabled(
			state.userClicks.length === 0 || !state.isGameActive,
		);
	}

	private updateUiFromState(): void {
		state.isMenuOpened = !state.isGameActive;
		const needsPointerTracking =
			state.areAlignmentGuidesEnabled || state.isGhostLineEnabled;
		const shouldLockTouch = state.isGameActive && needsPointerTracking;

		this.uiManager.setStartScreenVisible(!state.isGameActive);
		this.uiManager.setCanvasTouchMode(shouldLockTouch);
	}

	private refreshUIStats(): void {
		const attempts = state.results.length;
		const streak = state.currentStreak;

		const totalError = state.results.reduce(
			(sum, result) => sum + result.accuracy,
			0,
		);
		const overallAverageError = totalError / attempts;
		const overallPrecisionFraction =
			1 -
			Math.min(overallAverageError, SCORING.MAX_ERROR_TO_DISPLAY) /
				SCORING.MAX_ERROR_TO_DISPLAY;
		const average = Math.round(overallPrecisionFraction * 100);

		this.uiManager.updateStats(streak, average, attempts);
	}

	private handleUIFeatureToggle(): void {
		const needsPointerTracking =
			state.areAlignmentGuidesEnabled || state.isGhostLineEnabled;

		this.uiManager.updateToggleFeedback(state.isGameActive, needsPointerTracking);

		if (state.isGameActive) {
			this.draw();
		}
	}

	private syncUI(): void {
		const settings = this.uiManager.getGameSettings();
		Object.assign(state, settings);
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

	private drawIdealPlacement(): void {
		if (!state.isGameActive && state.comparisonShape.length > 0) {
			this.renderer.drawComparisonShape(state.comparisonShape);
		}
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
		const isUndoDisabled = state.userClicks.length === 0 || !state.isGameActive;

		this.uiManager.resetRoundUI(isUndoDisabled);
	}

	private generateNewPattern(): void {
		state.targetPoints = PatternGenerator.generate(state.pointsType);
	}

	private setupMemoryMode(): void {
		if (!state.isMemoryMode) return;

		setTimeout(() => {
			state.isTargetVisible = false;
			this.draw();
		}, state.targetVisibilityMs);

		setTimeout(() => {
			state.isCopyAreaHidden = false;
			this.draw();
		}, state.copyAreaMaskMs);
	}

	private hideCopyArea(): void {
		if (state.isGameActive && state.isMemoryMode && state.isCopyAreaHidden) {
			this.renderer.drawMask(PLACEHOLDER_TEXT.MASK);
		}
	}

	private handleIncompleteRound(): void {
		state.results.push({ accuracy: SCORING.ERROR_FOR_FAILED_ATTEMPT });
		state.currentStreak = 0;
		this.refreshUIStats();
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

		state.comparisonShape = calculateComparisonShape(
			state.userClicks,
			state.targetPoints,
			score.bestStartIndex,
			{
				layoutMode: state.layoutMode,
				isMirrorMode: state.isMirrorMode,
				isAbsoluteMode: state.isAbsoluteMode,
			},
		);

		const converter = this.getConverter();
		state.normalizedComparisonShape = converter.toNormalizedArray(
			state.comparisonShape,
			false,
		);

		state.results.push({ accuracy: score.distanceScore });

		this.uiManager.showResult(score.percentage, score.angleErrors);
		this.updateUndoButton();
		this.updateStreak(score.percentage);
		this.refreshUIStats();
		this.draw();
	}

	private updateStreak(percentage: number): void {
		state.currentStreak =
			percentage >= state.passThreshold ? state.currentStreak + 1 : 0;
	}

	private getConverter(): CoordinateConverter {
		return new CoordinateConverter(state.layoutMode, CANVAS.WIDTH, CANVAS.HEIGHT);
	}
}

export default GameController;
