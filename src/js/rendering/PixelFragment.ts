class PixelFragment {
	public size: number = 0;
	public isIdle: boolean = true;
	public isReverse: boolean = false;
	public isShimmer: boolean = false;
	public counter: number = 0;
	private speed: number;
	private maxSize: number;
	private minSize: number = 0.5;
	private sizeStep: number = Math.random() * 0.4;
	private counterStep: number;
	private ctx: CanvasRenderingContext2D;
	private x: number;
	private y: number;
	private color: string;
	private delay: number;

	constructor(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		color: string,
		speedFactor: number,
		delay: number,
		canvasWidth: number,
		canvasHeight: number,
		initialSize: number = 0,
	) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
		this.color = color;
		this.delay = delay;
		this.speed = (Math.random() * 0.8 + 0.1) * speedFactor;
		this.maxSize = Math.random() * 1.5 + 0.5;
		this.counterStep = Math.random() * 4 + (canvasWidth + canvasHeight) * 0.01;

		if (initialSize > 0) {
			this.size = this.maxSize;
			this.counter = this.delay + 1;
			this.isShimmer = true;
		}
	}

	private draw(): void {
		if (this.isIdle && this.size <= 0) return;

		const centerOffset = 1 - this.size * 0.5;
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
	}

	public appear(): void {
		this.isIdle = false;

		if (this.counter <= this.delay) {
			this.counter += this.counterStep;

			return;
		}

		if (this.size >= this.maxSize) {
			this.isShimmer = true;
		}

		if (this.isShimmer) {
			this.shimmer();
		} else {
			this.size += this.sizeStep;
		}

		this.draw();
	}

	public disappear(): void {
		this.isShimmer = false;
		this.counter = 0;

		if (this.size <= 0) {
			this.isIdle = true;

			return;
		} else {
			this.size -= 0.1;
		}

		this.draw();
	}

	public setPosition(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}

	private shimmer(): void {
		if (this.size >= this.maxSize) this.isReverse = true;
		else if (this.size <= this.minSize) this.isReverse = false;

		this.size += this.isReverse ? -this.speed : this.speed;
	}
}

export default PixelFragment;
