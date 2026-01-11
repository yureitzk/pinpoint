import { CANVAS } from '../core/canvas';
import { COLORS, GEOMETRY, MASK_FONT } from '../lib/constants';
import { state } from '../core/state';

class Renderer {
	private ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
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

	private drawMaskEffect(): void {
		const ctx = this.ctx;
		const isHorizontal = state.layoutMode === 'horizontal';

		const startX = isHorizontal ? CANVAS.DIVIDER : 0;
		const startY = isHorizontal ? 0 : CANVAS.DIVIDER;
		const width = isHorizontal ? CANVAS.WIDTH - CANVAS.DIVIDER : CANVAS.WIDTH;
		const height = isHorizontal ? CANVAS.HEIGHT : CANVAS.HEIGHT - CANVAS.DIVIDER;

		ctx.save();
		ctx.beginPath();
		ctx.rect(startX, startY, width, height);
		ctx.clip();

		const waveSpacing = 30;
		const amplitude = 20;
		const frequency = 0.02;

		const drawPass = (color: string, lineWidth: number, spacingMult: number) => {
			ctx.strokeStyle = color;
			ctx.lineWidth = lineWidth;

			if (isHorizontal) {
				for (let yOffset = 0; yOffset < height + amplitude; yOffset += waveSpacing * spacingMult) {
					ctx.beginPath();
					for (let x = startX; x <= startX + width; x++) {
						const dx = x - startX;
						const wave1 = Math.sin(dx * frequency) * amplitude;
						const wave2 = Math.sin(dx * frequency * 2 + yOffset * 0.05) * (amplitude / 3);

						if (x === startX) ctx.moveTo(x, yOffset + wave1 + wave2);
						else ctx.lineTo(x, yOffset + wave1 + wave2);
					}
					ctx.stroke();
				}
			} else {
				for (let xOffset = 0; xOffset < width + amplitude; xOffset += waveSpacing * spacingMult) {
					ctx.beginPath();
					for (let y = startY; y <= startY + height; y++) {
						const dy = y - startY;
						const wave1 = Math.sin(dy * frequency) * amplitude;
						const wave2 = Math.sin(dy * frequency * 2 + xOffset * 0.05) * (amplitude / 3);

						if (y === startY) ctx.moveTo(xOffset + wave1 + wave2, y);
						else ctx.lineTo(xOffset + wave1 + wave2, y);
					}
					ctx.stroke();
				}
			}
		};

		drawPass('rgba(255, 255, 255, 0.04)', 1.5, 1);
		drawPass('rgba(255, 255, 255, 0.08)', 2, 5);

		ctx.restore();
	}

	drawMask(text: string): void {
		this.ctx.fillStyle = COLORS.MASK;
		if (state.layoutMode === 'horizontal') {
			this.ctx.fillRect(CANVAS.DIVIDER, 0, CANVAS.DIVIDER, CANVAS.HEIGHT);
		} else {
			this.ctx.fillRect(0, CANVAS.DIVIDER, CANVAS.WIDTH, CANVAS.DIVIDER);
		}

		this.drawMaskEffect();

		this.ctx.fillStyle = COLORS.MASK_TEXT;
		this.ctx.font = MASK_FONT;
		this.ctx.textAlign = 'center';
		this.ctx.textBaseline = 'middle';
		let textX: number;
		let textY: number;

		if (state.layoutMode === 'horizontal') {
			textX = CANVAS.DIVIDER + CANVAS.DIVIDER / 2;
			textY = CANVAS.HEIGHT / 2;
		} else {
			textX = CANVAS.WIDTH / 2;
			textY = CANVAS.DIVIDER + CANVAS.DIVIDER / 2;
		}

		this.ctx.fillText(text, textX, textY);
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
