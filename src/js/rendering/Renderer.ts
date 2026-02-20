import { CANVAS } from '../core/canvas';
import { COLORS, GEOMETRY } from '../lib/constants';
import { state } from '../core/state';
import PixelFragment from './GridFragment';

class Renderer {
	private ctx: CanvasRenderingContext2D;
	private animationFrameId: number | null = null;
	private pixels: PixelFragment[] = [];
	private animationMode: 'appear' | 'disappear' = 'disappear';
	private onDrawUpdate?: () => void;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	setDrawUpdate(callback: () => void) {
		this.onDrawUpdate = callback;
	}

	startLoadingAnimation(): void {
		if (this.animationFrameId !== null) return;
		const loop = () => {
			if (this.onDrawUpdate) this.onDrawUpdate();
			this.animationFrameId = requestAnimationFrame(loop);
		};
		this.animationFrameId = requestAnimationFrame(loop);
	}

	stopLoadingAnimation(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	initMaskPixels(): void {
		const isHorizontal = state.layoutMode === 'horizontal';
		const startX = isHorizontal ? CANVAS.DIVIDER : 0;
		const startY = isHorizontal ? 0 : CANVAS.DIVIDER;
		const width = isHorizontal ? CANVAS.WIDTH - CANVAS.DIVIDER : CANVAS.WIDTH;
		const height = isHorizontal ? CANVAS.HEIGHT : CANVAS.HEIGHT - CANVAS.DIVIDER;

		const gap = 6;
		const speed = 0.035;
		const colors = [COLORS.MASK_GRID_BASE, COLORS.MASK_GRID_GLINT, COLORS.MASK_GRID_LIGHT];

		this.pixels = [];
		for (let x = startX; x < startX + width; x += gap) {
			for (let y = startY; y < startY + height; y += gap) {
				const centerX = startX + width / 2;
				const centerY = startY + height / 2;
				const delay = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
				const color = colors[Math.floor(Math.random() * colors.length)];
				this.pixels.push(new PixelFragment(this.ctx, x, y, color, speed, delay, width, height));
			}
		}
	}

	clear(): void {
		this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
	}

	drawLines(points: Point[], color: string, options: { dashed?: boolean; closed?: boolean } = {}): void {
		if (points.length < 2) return;

		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.strokeStyle = color;
		this.ctx.lineWidth = 2;
		this.ctx.globalAlpha = 0.7;

		if (options.dashed) {
			this.ctx.setLineDash([5, 5]);
		}

		this.ctx.moveTo(points[0].x, points[0].y);
		points.slice(1).forEach((p) => this.ctx.lineTo(p.x, p.y));

		if (options.closed) {
			this.ctx.closePath();
		}

		this.ctx.stroke();
		this.ctx.restore();
	}

	drawPoint(x: number, y: number, color: string, isSmall = false, isReference = false): void {
		const fillColor = isReference ? COLORS.TARGET_REFERENCE : color;
		const radius = isSmall ? 2 : GEOMETRY.POINT_RADIUS;

		this.ctx.beginPath();
		this.ctx.arc(x, y, radius, 0, Math.PI * 2);
		this.ctx.fillStyle = fillColor;
		this.ctx.fill();
	}

	setMaskAnimation(mode: 'appear' | 'disappear'): void {
		this.animationMode = mode;
	}

	drawMask(): void {
		const isHorizontal = state.layoutMode === 'horizontal';
		const x = isHorizontal ? CANVAS.DIVIDER : 0;
		const y = isHorizontal ? 0 : CANVAS.DIVIDER;
		const width = isHorizontal ? CANVAS.WIDTH - CANVAS.DIVIDER : CANVAS.WIDTH;
		const height = isHorizontal ? CANVAS.HEIGHT : CANVAS.HEIGHT - CANVAS.DIVIDER;

		this.ctx.fillStyle = COLORS.MASK_BG;
		this.ctx.fillRect(x, y, width, height);

		for (const pixel of this.pixels) {
			if (this.animationMode === 'appear') pixel.appear();
			else pixel.disappear();
		}
	}

	drawGhostLine(from: Point, to: Point): void {
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.moveTo(from.x, from.y);
		this.ctx.lineTo(to.x, to.y);
		this.ctx.strokeStyle = COLORS.GHOST_LINE;
		this.ctx.lineWidth = 2;
		this.ctx.setLineDash([6, 4]);
		this.ctx.stroke();
		this.ctx.restore();
	}

	drawCrosshair(x: number, y: number): void {
		this.ctx.save();
		this.ctx.strokeStyle = COLORS.CROSSHAIR;
		this.ctx.lineWidth = 1;
		this.ctx.setLineDash([2, 2]);

		this.ctx.beginPath();
		this.ctx.moveTo(x, 0);
		this.ctx.lineTo(x, CANVAS.HEIGHT);
		this.ctx.moveTo(0, y);
		this.ctx.lineTo(CANVAS.WIDTH, y);
		this.ctx.stroke();

		this.ctx.restore();
	}

	drawComparisonShape(points: Point[]): void {
		this.drawLines(points, COLORS.COMPARISON, { closed: true });

		points.forEach((p) => {
			this.drawPoint(p.x, p.y, COLORS.COMPARISON, true, false);
		});
	}
}

export default Renderer;
