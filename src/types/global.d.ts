interface Point {
	x: number;
	y: number;
}

interface GameResult {
	accuracy: number;
}

type LayoutMode = 'horizontal' | 'vertical';

interface GameState {
	pointsType: number;
	targetPoints: Point[];
	userClicks: Point[];
    comparisonShape: Point[];
	normalizedComparisonShape: Point[];
	normalizedTargetPoints: Point[]; 
    normalizedUserClicks: Point[];
	isGameActive: boolean;
	isMirrorMode: boolean;
	isAbsoluteMode: boolean;
	isMemoryMode: boolean;
	isGhostLineEnabled: boolean;
	isTargetVisible: boolean;
	isCopyAreaHidden: boolean;
	isMenuOpened: boolean;
	results: GameResult[];
	currentStreak: number;
	mousePosition: Point;
	areAlignmentGuidesEnabled: boolean;
	layoutMode: LayoutMode;
}

interface ColorObject {
	color: string;
	value: number;
}
