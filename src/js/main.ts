import '../css/style.css';
import { dom } from './ui/dom';
import { setupCanvas } from './core/canvas';
import Renderer from './rendering/Renderer';
import { setupEventListeners } from './ui/events';
import { initModal } from './ui/modal';
import GameController from './game/GameController';
import UIManager from './ui/UIManager';

function main(): void {
	setupCanvas();
	const renderer = new Renderer(dom.ctx);
	const ui = new UIManager();
	const game = new GameController(renderer, ui);
	initModal();
	setupEventListeners(game);
}

main();
