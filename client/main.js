import Renderer from './lib/Renderer';
import Vector2 from './lib/Vector2';
import World from './lib/World';
import {keyboard, mouse} from './lib/input';
import {connect, sendMsg} from './communication';
import {resources} from './resources'

window.PLAYER_NICK = "foobar";
window.GAME_ID = "gameid0123";

import Game from './game/JetPackGame';

var canvas = document.createElement('canvas');
var game, renderer, world, token, frame = 0;
var debug = true;
var offset = new Vector2();

function renderSoldierInfo(soldier) {
  let li = document.createElement('li');
  let percentage = soldier.health * 100;
  li.innerHTML = `
    <strong>${soldier.name}</strong>
    <span class="health">
     <span class="health-bar" style="width:${percentage}%"></span> 
    </span>
    <div class="points">Points: ${soldier.points || 0}</div>
  `;
  if (soldier.killed) {
    li.classList.add('killed')
  }
  return li;
}

function onPoints(soldier, points, game) {
  createInfo(game);
}

function createInfo(game) {
  let info = document.getElementById('info');
  info.innerHTML = '';
  let rows = [].concat(game.world.soldiers).sort((a, b) => {
    if (a.points < b.points) {
      return 1;
    }
    if (a.points > b.points) {
      return -1;
    }
  }).map(soldier => renderSoldierInfo(soldier));
  rows.forEach(row => info.appendChild(row));
}

const CWIDTH = 680;
const CHEIGHT = 460;

function init() {
  canvas.width = CWIDTH;
  canvas.height = CHEIGHT;
  document.getElementById('canvas').appendChild(canvas);
}

function startGame(nick) {
  renderer = new Renderer({canvas});
  world = new World(CWIDTH, CHEIGHT);
  game = new Game({world, renderer, keyboard, mouse, nick, onPoints: function (soldier, points) {
    onPoints(soldier, points, game)
  }});
  calcOffset();
  cancelAnimationFrame(token);
  loop();
  window.game = game;
  createInfo(game);
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
  if (rect) {
    offset.x = rect.left;
    offset.y = rect.top;
  }
}

function resize() {
  calcOffset();
}

function onNick(nick) {
  showScreen('gameplay');
  sendMsg({
    type: "ready",
    nick,
    game: window.GAME_ID
  });
 startGame(nick);
}

function showScreen(screenName) {
  document.querySelector('.screen').classList.add('hidden');
  document.querySelector('#' + screenName).classList.remove('hidden');
}

function bindEvents() {
  document.querySelector('#setup form').addEventListener('submit', e => {
    e.preventDefault();
    let nick = document.querySelector('#setup form [name=nick]');
    onNick(nick.value)
  });
}

window.addEventListener('load', () => {
  bindEvents();
  connect(() => {
    console.log('CONNECTED')
    resources.load(init);
  });
});

window.addEventListener('resize', resize);