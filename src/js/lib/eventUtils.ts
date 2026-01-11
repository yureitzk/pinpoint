import { CANVAS } from '../core/canvas';
import type GameController from '../game/GameController';

export function getCanvasCoordinates(canvas: HTMLCanvasElement, e: PointerEvent): { x: number; y: number } {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (e.clientX - rect.left) * (CANVAS.WIDTH / rect.width),
		y: (e.clientY - rect.top) * (CANVAS.HEIGHT / rect.height),
	};
}

export function updateMousePosition(state: GameState, coords: { x: number; y: number }): void {
	state.mousePosition.x = coords.x;
	state.mousePosition.y = coords.y;
}

export function trackDraggingMovement(coords: { x: number; y: number }, pointerState: PointerState): void {
	const dx = coords.x - pointerState.lastPointerDownPosition.x;
	const dy = coords.y - pointerState.lastPointerDownPosition.y;
	const distance = Math.sqrt(dx * dx + dy * dy);

	if (distance > 5) {
		pointerState.hasMovedWhileDragging = true;
	}
}

export function isInClickCooldown(lastClickTime: number, clickCooldownMs: number): boolean {
	const now = Date.now();
	return now - lastClickTime < clickCooldownMs;
}

export function startDragging(coords: { x: number; y: number }, state: GameState, pointerState: PointerState): void {
	pointerState.lastPointerDownPosition = coords;
	state.mousePosition = { ...coords };
	pointerState.isDragging = true;
	pointerState.hasMovedWhileDragging = false;
}

export function calculateDistance(point1: { x: number; y: number }, point2: { x: number; y: number }): number {
	const dx = point1.x - point2.x;
	const dy = point1.y - point2.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function handleDragEnd(
	coords: { x: number; y: number },
	pointerState: PointerState,
	game: GameController,
	dragThreshold: number,
	clickCooldownMs: number,
): void {
	const distance = calculateDistance(coords, pointerState.lastPointerDownPosition);
	const isWithinCooldown = isInClickCooldown(pointerState.lastClickTime, clickCooldownMs);

	if (distance < dragThreshold && !pointerState.hasMovedWhileDragging && !isWithinCooldown) {
		game.handleClick(coords.x, coords.y);
		pointerState.lastClickTime = Date.now();
	}
}

export function cleanupDragging(pointerState: PointerState, canvas: HTMLCanvasElement, e: PointerEvent): void {
	pointerState.isDragging = false;
	pointerState.hasMovedWhileDragging = false;
	releasePointerCaptureSafely(canvas, e);
}

export function releasePointerCaptureSafely(canvas: HTMLCanvasElement, e: PointerEvent): void {
	try {
		canvas.releasePointerCapture(e.pointerId);
	} catch (err) {
		// Pointer might not be captured, ignore error
	}
}
