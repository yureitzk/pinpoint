import { getLayoutMode } from '../lib/utils';

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
	results: [],
	isMenuOpened: true,
	comparisonShape: [],
	currentStreak: 0,
	mousePosition: { x: 0, y: 0 },
	areAlignmentGuidesEnabled: false,
	layoutMode: getLayoutMode(),
};
