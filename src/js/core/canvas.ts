import { state } from './state';
import { dom } from '../ui/dom';

export const CANVAS = {
	get WIDTH() {
		return dom.canvas.clientWidth;
	},
	get HEIGHT() {
		return dom.canvas.clientHeight;
	},
	get DIVIDER() {
		return state.layoutMode === 'horizontal' ? this.WIDTH / 2 : this.HEIGHT / 2;
	},
};

export function setupCanvas(): void {
	const { canvas } = dom;

	canvas.removeAttribute('height');
	canvas.removeAttribute('width');

	const dpr = window.devicePixelRatio || 1;
	const rect = canvas.getBoundingClientRect();

	canvas.width = Math.round(rect.width * dpr);
	canvas.height = Math.round(rect.height * dpr);

	const ctx = canvas.getContext('2d');
	if (ctx) {
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
}
