import { dom } from './dom';
import { PLACEHOLDER_TEXT, COLORS, TIMING, THRESHOLD_FALLBACK } from '../lib/constants';
import { clamp } from '../lib/mathUtils';
import { getScoreColor, getAngleErrorColor } from '../lib/colorUtils';

class UIManager {
	public updateStats(streak: number, average: number, attempts: number): void {
		dom.streakSpan.textContent = streak > 0 ? streak.toString() : PLACEHOLDER_TEXT.STREAK_SPAN;

		const attemptsLabel = attempts === 1 ? PLACEHOLDER_TEXT.ATTEMPTS_DISPLAY_ONE : PLACEHOLDER_TEXT.ATTEMPTS_DISPLAY_MANY;
		dom.attemptsDisplay.textContent = `${attempts} ${attemptsLabel}`;

		if (attempts === 0) {
			dom.averagePercentage.textContent = PLACEHOLDER_TEXT.AVERAGE_PERCENTAGE;
			dom.progressBar.style.width = '0%';
			return;
		}

		dom.averagePercentage.textContent = `${average}%`;
		dom.progressBar.style.width = `${average}%`;
		dom.progressBar.style.backgroundColor = getScoreColor(average);
	}

	public setUndoDisabled(disabled: boolean) {
		dom.undoButton.disabled = disabled;
	}

	public showResult(score: number, angleError: string) {
		dom.scoreSpan.textContent = `${score}`;
		dom.scoreSpan.style.color = getScoreColor(score);
		dom.angleErrorSpan.textContent = angleError;
		dom.angleErrorSpan.style.color = getAngleErrorColor(parseFloat(angleError));
	}

	public resetRoundUI(isUndoDisabled: boolean): void {
		dom.scoreSpan.textContent = PLACEHOLDER_TEXT.SCORE_SPAN;
		dom.scoreSpan.style.color = COLORS.TEXT_FALLBACK;

		dom.angleErrorSpan.textContent = PLACEHOLDER_TEXT.ANGLE_ERROR_SPAN;
		dom.angleErrorSpan.style.color = COLORS.TEXT_FALLBACK;

		this.setUndoDisabled(isUndoDisabled);
	}

	public setCanvasTouchMode(needsPointerLock: boolean): void {
		dom.canvas.style.touchAction = needsPointerLock ? 'none' : 'auto';
	}

	public setStartScreenVisible(isVisible: boolean): void {
		dom.startScreen.classList.toggle('hidden', !isVisible);
	}

	public getGameSettings() {
		return {
			isMirrorMode: dom.mirrorCheckbox.checked,
			isAbsoluteMode: dom.absoluteCheckbox.checked,
			isMemoryMode: dom.memoryCheckbox.checked,
			isGhostLineEnabled: dom.ghostLineCheckbox.checked,

			pointsType: parseInt(dom.pointsSelect.value) || 2,

			targetVisibilityMs: Math.max(0, parseInt(dom.targetVisibilityDuration.value)) || TIMING.TARGET_VISIBILITY_MS,

			copyAreaMaskMs: Math.max(0, parseInt(dom.copyAreaHiddenDuration.value)) || TIMING.COPY_AREA_MASK_MS,

			passThreshold: clamp(parseInt(dom.passThresholdInput.value) || THRESHOLD_FALLBACK, 0, 100),
		};
	}

	public updateToggleFeedback(isGameActive: boolean, needsPointerLock: boolean): void {
		dom.canvas.style.touchAction = isGameActive && needsPointerLock ? 'none' : 'auto';
	}
}

export default UIManager;
