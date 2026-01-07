import '../css/style.css';
import { dom } from './ui/dom';
import { setupCanvas } from './core/canvas';
import Renderer from './rendering/Renderer';
import { setupEventListeners } from './ui/events';
import { initModal } from './ui/modal';
import GameController from './game/GameController';

function main(): void {
	setupCanvas();
	const renderer = new Renderer(dom.ctx);
	const game = new GameController(renderer);
	initModal();
	setupEventListeners(game);
}

main();
