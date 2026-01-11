export const GEOMETRY = {
	POINT_RADIUS: 3,
	MIN_RADIUS: 50,
	MAX_RADIUS: 120,
	MAX_DISTORTION: 40,
} as const;

export const TIMING = {
	TARGET_VISIBILITY_MS: 2000,
	COPY_AREA_MASK_MS: 3000,
} as const;

export const THRESHOLD_FALLBACK = 90;

export const MASK_FONT = 'bold 2.4rem Roboto, Inter, system-ui, -apple-system, Segoe UI, sans-serif';

export const PLACEHOLDER_TEXT = {
	SCORE_SPAN: '--',
	ANGLE_ERROR_SPAN: '--',
	STREAK_SPAN: '--',
	ATTEMPTS_DISPLAY_MANY: 'Rounds',
	ATTEMPTS_DISPLAY_ONE: 'Round',
	AVERAGE_PERCENTAGE: 'n/a',
	MASK: 'Wait...',
} as const;

export const COLORS = {
	MASK: '#18181b',
	MASK_TEXT: '#9a9aa3',
	TARGET_DEFAULT: '#4fd1c5',
	TARGET_REFERENCE: '#e6f7f4',
	USER_LINES_PROGRESS: 'rgba(79, 209, 197, 0.25)',
	USER_LINES_FINAL: '#7dd3fc',
	USER_POINTS_PROGRESS: '#93c5fd',
	USER_POINTS_FINAL: '#a5d8ff',
	GHOST_LINE: '#a5b4fc',
	CROSSHAIR: '#8a8a8e',
	COMPARISON: '#c4b5fd',
	DIVIDER: '#e5e7eb',
	PRECISION_FULL: '#34d399',
	PRECISION_HIGH: '#fbbf24',
	PRECISION_MEDIUM: '#fb923c',
	PRECISION_LOW: '#f87171',
	PROGRESS_BAR_FALLBACK: 'oklch(48% 0.05 250)',
	TEXT_FALLBACK: '#cccccc',
} as const;

export const SCORING = {
	MAX_ERROR_TO_DISPLAY: 100,
	ERROR_FOR_FAILED_ATTEMPT: 200,
} as const;

export const CLICK_COOLDOWN_MS = 150;
export const DRAG_THRESHOLD = 15; // pixels
