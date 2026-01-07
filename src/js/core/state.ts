import { getLayoutMode } from '../lib/gameUtils';
import { THRESHOLD_FALLBACK, TIMING } from '../lib/constants';

export const state: GameState = {
	pointsType: 2,
	targetPoints: [],
	userClicks: [],
	normalizedTargetPoints: [],
	normalizedUserClicks: [],
	normalizedComparisonShape: [],
	isGameActive: false,
	isMirrorMode: false,
	isAbsoluteMode: false,
	isMemoryMode: false,
	isGhostLineEnabled: true,
	isTargetVisible: true,
	isCopyAreaHidden: false,
	targetVisibilityMs: TIMING.TARGET_VISIBILITY_MS,
	copyAreaMaskMs: TIMING.COPY_AREA_MASK_MS,
	passThreshold: THRESHOLD_FALLBACK,
	results: [],
	isMenuOpened: true,
	comparisonShape: [],
	currentStreak: 0,
	mousePosition: { x: 0, y: 0 },
	areAlignmentGuidesEnabled: false,
	layoutMode: getLayoutMode(),
};
