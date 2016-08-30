import Renderer from './lib/Renderer';
import Vector2 from './lib/Vector2';
import World from './lib/World';
import {keyboard, mouse} from './lib/input';
import {socket} from './communication';

import Game from './game/JetPackGame';

var canvas = document.createElement('canvas');
var game, renderer, world, token, frame = 0;
var debug = true;
var offset = new Vector2();

function init() {
  canvas.width = 680;
  canvas.height = 460;
  document.body.appendChild(canvas);
  renderer = new Renderer({canvas});
  world = new World();
  game = new Game({world, renderer, keyboard, mouse});
  calcOffset();
  cancelAnimationFrame(token);
  loop();
  window.game = game;
}

function loop() {
  frame++;
  mouse.setOffset(offset);
  game.tick(frame);
  renderer.render(frame, debug);
  token = requestAnimationFrame(loop);
}

function calcOffset() {
  let rect = canvas.getClientRects()[0];
  offset.x = rect.left;
  offset.y = rect.top;
  
}

function resize() {
  calcOffset();
}

window.addEventListener('load', init);
window.addEventListener('resize', resize);