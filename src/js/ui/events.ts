import { dom } from './dom';
import { CANVAS, setupCanvas } from '../core/canvas';
import { state } from '../core/state';
import { getLayoutMode } from '../lib/utils';
import CoordinateSystem from '../core/CoordinateSystem';
import type GameController from '../game/GameController';

import hotkeys from 'hotkeys-js';

function handleResize(game: GameController): void {
	state.layoutMode = getLayoutMode();
	setupCanvas();

	const w = dom.canvas.clientWidth;
	const h = dom.canvas.clientHeight;

	if (state.normalizedTargetPoints?.length > 0) {
		state.targetPoints = state.normalizedTargetPoints.map((p) =>
			CoordinateSystem.toPixels(p, state.layoutMode, w, h, true),
		);
	}

	if (state.normalizedUserClicks?.length > 0) {
		state.userClicks = state.normalizedUserClicks.map((p) =>
			CoordinateSystem.toPixels(p, state.layoutMode, w, h, false),
		);
	}

	if (state.normalizedComparisonShape?.length > 0) {
		state.comparisonShape = state.normalizedComparisonShape.map((p) =>
			CoordinateSystem.toPixels(p, state.layoutMode, w, h, false),
		);
	}

	const normMouse = CoordinateSystem.toNormalized(
		state.mousePosition,
		state.layoutMode,
		w,
		h,
		false,
	);
	state.mousePosition = CoordinateSystem.toPixels(
		normMouse,
		state.layoutMode,
		w,
		h,
		false,
	);

	game.draw();
}

export function setupEventListeners(game: GameController): void {
	let lastPointerDownPosition = { x: 0, y: 0 };
	let isDragging = false;

	const getCanvasCoords = (e: PointerEvent) => {
		const rect = dom.canvas.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left) * (CANVAS.WIDTH / rect.width),
			y: (e.clientY - rect.top) * (CANVAS.HEIGHT / rect.height),
		};
	};

	dom.canvas.addEventListener('pointermove', (e) => {
		const coords = getCanvasCoords(e);
		state.mousePosition.x = coords.x;
		state.mousePosition.y = coords.y;

		if (state.isGameActive) game.draw();
	});

	dom.canvas.addEventListener('pointerdown', (e) => {
		const coords = getCanvasCoords(e);

		lastPointerDownPosition = coords;
		state.mousePosition = { ...coords };

		isDragging = true;
		dom.canvas.setPointerCapture(e.pointerId);

		if (state.isGameActive) game.draw();
	});

	dom.canvas.addEventListener('pointerup', (e) => {
		if (!isDragging) return;

		const coords = getCanvasCoords(e);

		const dx = coords.x - lastPointerDownPosition.x;
		const dy = coords.y - lastPointerDownPosition.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		if (distance < 15) {
			game.handleClick(coords.x, coords.y);
		}

		isDragging = false;
		dom.canvas.releasePointerCapture(e.pointerId);
	});

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

	hotkeys('ctrl+z', function (e) {
		e.preventDefault();
		game.undoLastClick();
	});

	hotkeys('r', function () {
		game.resetStats();
	});

	hotkeys('space', function (event) {
		if (event.target === document.body) {
			event.preventDefault();
			game.startRound();
		}
	});

	dom.undoButton.addEventListener('click', () => {
		game.undoLastClick();
	});

	dom.ghostLineCheckbox.addEventListener('change', () => {
		game.toggleGhostLine(dom.ghostLineCheckbox.checked);
	});

	dom.alignmentGuidesCheckbox.addEventListener('change', () => {
		game.toggleAlignmentGuides(dom.alignmentGuidesCheckbox.checked);
	});

	let resizeTimeout: number;
	window.addEventListener('resize', () => {
		cancelAnimationFrame(resizeTimeout);
		resizeTimeout = requestAnimationFrame(() => {
			handleResize(game);
		});
	});

	dom.startButton.addEventListener('click', () => game.startRound());
	dom.resetButton.addEventListener('click', () => game.resetStats());
}
