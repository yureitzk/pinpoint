import { dom } from './dom';
import { setupCanvas } from '../core/canvas';
import { state } from '../core/state';
import { getLayoutMode } from '../lib/gameUtils';
import type GameController from '../game/GameController';
import hotkeys from 'hotkeys-js';
import { createConverter } from '../lib/cordinateUtils';
import { CLICK_COOLDOWN_MS, DRAG_THRESHOLD } from '../lib/constants';
import {
	getCanvasCoordinates,
	updateMousePosition,
	trackDraggingMovement,
	isInClickCooldown,
	startDragging,
	handleDragEnd,
	cleanupDragging,
	releasePointerCaptureSafely,
} from '../lib/eventUtils';

function handleResize(game: GameController): void {
	state.layoutMode = getLayoutMode();
	setupCanvas();

	const converter = createConverter(state.layoutMode, dom.canvas);

	if (state.normalizedTargetPoints?.length > 0) {
		state.targetPoints = converter.toPixelsArray(
			state.normalizedTargetPoints,
			true,
		);
	}

	if (state.normalizedUserClicks?.length > 0) {
		state.userClicks = converter.toPixelsArray(state.normalizedUserClicks, false);
	}

	if (state.normalizedComparisonShape?.length > 0) {
		state.comparisonShape = converter.toPixelsArray(
			state.normalizedComparisonShape,
			false,
		);
	}

	const normMouse = converter.toNormalized(state.mousePosition, false);
	state.mousePosition = converter.toPixels(normMouse, false);

	game.draw();
}

export function setupEventListeners(game: GameController): void {
	const pointerState: PointerState = {
		lastPointerDownPosition: { x: 0, y: 0 },
		isDragging: false,
		hasMovedWhileDragging: false,
		lastClickTime: 0,
	};

	setupPointerEvents(game, pointerState);
	setupControlEvents(game);

	setupControlEvents(game);
	setupKeyboardEvents(game);
	setupWindowEvents(game);
}

function setupPointerEvents(
	game: GameController,
	pointerState: PointerState,
): void {
	dom.canvas.addEventListener(
		'pointermove',
		createPointerMoveHandler(game, pointerState),
	);
	dom.canvas.addEventListener(
		'pointerdown',
		createPointerDownHandler(game, pointerState),
	);
	dom.canvas.addEventListener(
		'pointerup',
		createPointerUpHandler(game, pointerState),
	);
	dom.canvas.addEventListener(
		'pointercancel',
		createPointerCancelHandler(pointerState),
	);
}

function createPointerMoveHandler(
	game: GameController,
	pointerState: PointerState,
): (e: PointerEvent) => void {
	return (e) => {
		const coords = getCanvasCoordinates(dom.canvas, e);
		updateMousePosition(state, coords);

		if (pointerState.isDragging) {
			trackDraggingMovement(coords, pointerState);
		}

		if (state.isGameActive) game.draw();
	};
}

function createPointerDownHandler(
	game: GameController,
	pointerState: PointerState,
): (e: PointerEvent) => void {
	return (e) => {
		if (isInClickCooldown(pointerState.lastClickTime, CLICK_COOLDOWN_MS)) {
			e.preventDefault();
			return;
		}

		const coords = getCanvasCoordinates(dom.canvas, e);
		startDragging(coords, state, pointerState);
		dom.canvas.setPointerCapture(e.pointerId);

		if (state.isGameActive) game.draw();
	};
}

function createPointerUpHandler(
	game: GameController,
	pointerState: PointerState,
): (e: PointerEvent) => void {
	return (e) => {
		if (!pointerState.isDragging) return;

		const coords = getCanvasCoordinates(dom.canvas, e);
		handleDragEnd(coords, pointerState, game, DRAG_THRESHOLD, CLICK_COOLDOWN_MS);
		cleanupDragging(pointerState, dom.canvas, e);
	};
}

function createPointerCancelHandler(
	pointerState: PointerState,
): (e: PointerEvent) => void {
	return (e) => {
		pointerState.isDragging = false;
		pointerState.hasMovedWhileDragging = false;
		releasePointerCaptureSafely(dom.canvas, e);
	};
}

function setupControlEvents(game: GameController): void {
	dom.startButton.addEventListener('click', () => game.startRound());
	dom.resetButton.addEventListener('click', () => game.resetStats());
	dom.undoButton.addEventListener('click', () => game.undoLastClick());

	dom.ghostLineCheckbox.addEventListener('change', () => {
		game.toggleGhostLine(dom.ghostLineCheckbox.checked);
	});

	dom.alignmentGuidesCheckbox.addEventListener('change', () => {
		game.toggleAlignmentGuides(dom.alignmentGuidesCheckbox.checked);
	});
}

function setupKeyboardEvents(game: GameController): void {
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Shift' && !dom.alignmentGuidesCheckbox.checked) {
			game.toggleAlignmentGuides(true);
		}
	});

	window.addEventListener('keyup', (e) => {
		if (e.key === 'Shift' && !dom.alignmentGuidesCheckbox.checked) {
			game.toggleAlignmentGuides(false);
		}
	});

	hotkeys('ctrl+z', (e) => {
		e.preventDefault();
		game.undoLastClick();
	});

	hotkeys('r', () => {
		game.resetStats();
	});

	hotkeys('space', (event) => {
		if (event.target === document.body) {
			event.preventDefault();
			game.startRound();
		}
	});
}

function setupWindowEvents(game: GameController): void {
	let resizeTimeout: number;

	window.addEventListener('resize', () => {
		cancelAnimationFrame(resizeTimeout);
		resizeTimeout = requestAnimationFrame(() => {
			handleResize(game);
		});
	});
}
