import Entity from '../lib/Entity';
import Soldier from './Soldier';
import Bullet from './Bullet';
import Ground from './Ground';

import {sendMsg} from '../communication'

const SOLDIERS = 4;
const KILL_POINTS = 100;
const SINGLE_HIT_POINTS = 1;


export default class JetPackGame {
  constructor({renderer, world, keyboard, mouse, onPoints, onState, nick}) {
    this.renderer = renderer;
    this.world = world;
    this.renderer.children = this.world.children;
    this.keyboard = keyboard;
    this.mouse = mouse;
    this.nick = nick;
    this.createGround();
    this.createSoldiers();
    this.onPoints = onPoints;
    this.onState = onState;
    this.startSendingMessages();
    this.state = JetPackGame.STATE_GAMEPLAY;
  }

  getPlayerState() {
      return {
        health: this.myself.health,
        points: this.myself.points,
        killed: this.myself.killed,
        x: this.myself.position.x,
        y: this.myself.position.y
      }
  }

  getBulletsState() {
    return this.world.children
            .filter(child => {
                return child.ownerId == this.myself.id
            })
            .map(bullet => [bullet.position.x, bullet.position.y, bullet.lifetime]);
  }


  getMessagePayload() {
    return {
      type: "state",
      player: this.getPlayerState(),
      bullets: this.getBulletsState()
    };
  }

  startSendingMessages() {
    setInterval(() => {
      sendMsg(this.getMessagePayload())
    }, 1000 / 16);
  }

  createSoldiers() {
    this.world.soldiers = [];
    let x = 20;
    let y = 100;
    let distance = 100;
    let onKill = this.onKill.bind(this);
    for (let i = 0; i < SOLDIERS; ++i) {
      let soldier = new Soldier(i * distance, y, {onKill});
      this.world.soldiers.push(soldier)
    }
    this.world.soldiers.forEach(soldier => this.add(soldier));
    this.myself = this.world.soldiers[0];
    this.myself.name = this.nick;
  }

  createPlatform() {
    
  }

  createGround() {
    var c = 20;
    var w = 32;
    while(c--) {
      this.add(new Ground(w * c, 400, w, w));
    }
  }

  mouseHandler(frame) {
    if (this.myself.killed && this.state !== JetPackGame.STATE_GAMEPLAY) {
      return;
    }
    if (this.mouse.button[0]) {
      this.world.soldiers[0].fire(frame);
    }
    this.myself.setTarget(this.mouse);
  }

  keyboardHandler(frame) {
    if (this.myself.killed && this.state !== JetPackGame.STATE_GAMEPLAY) {
      return;
    }

    let v = 0.3;
    if (this.keyboard.up || this.keyboard.w) {
      this.myself.acceleration.y -= v * 1.5;
    }
    if (this.keyboard.down  || this.keyboard.s) {
      this.myself.acceleration.y += v;
    }
    if (this.keyboard.left || this.keyboard.a) {
      this.myself.acceleration.x -= v;
    }
    if (this.keyboard.right || this.keyboard.d) {
      this.myself.acceleration.x += v;
    }
  }

  add(child) {
    this.world.add(child);
  }

  remove(child) {
    this.world.remove(child);
  }

  tick(frame) {
    this.keyboardHandler(frame);
    this.mouseHandler(frame);
    this.world.tick(frame);
    this.handleBulltes(frame);
  }

  addPoints(soldier, points) {
    soldier.addPoints(points);
    this.onPoints(soldier, points);
  }

  onKill(killerId) {
    if (killerId) {
      let soldier = getSoldierById(this, killerId);
      this.addPoints(soldier, KILL_POINTS);
    } else {
      this.addPoints(this.myself, 0)
    }
    this.checkForGameOver();
  }

  checkForGameOver() {
    let soldiersAlive = this.world.soldiers.filter(soldier => !soldier.killed);
    if (!soldiersAlive.length) {
      this.setGameOver();
    }
    if (soldiersAlive.length === 1) {
      this.setGameWinner(soldiersAlive[0]);
    }
  }

  setGameWinner(soldier) {
    console.log('WINNER:', soldier.name);
    this.setState(JetPackGame.STATE_GAMEWIN)
  }

  setGameOver() {
    console.log('GAME OVER');
    this.setState(JetPackGame.STATE_GAMEOVER)
  }

  setState(state) {
    this.state = state;
    this.onState && this.onState(state);
  }

  handleBulltes(frame) {
    let soldiers = this.world.soldiers.filter(s => !s.killed);
    this.world.children.forEach(child => {
      if (child instanceof Bullet) {
        if (child.checkLifetime(frame)) {
          this.world.remove(child);
        }
        for (let n = 0; n < soldiers.length; ++n) {
          if (child.ownerId !== soldiers[n].id) {
            let collision = this.world.getCollision(child, soldiers[n]);
            if (collision.x && collision.y) {
              this.addPoints(getSoldierById(this, child.ownerId), SINGLE_HIT_POINTS);
              soldiers[n].addDamage(child.damagePoints, child.ownerId);
              this.world.remove(child);
            }
          }
        }
      }
    });
  }
}


JetPackGame.STATE_GAMEPLAY = 0x0;
JetPackGame.STATE_GAMEOVER = 0x1;
JetPackGame.STATE_GAMEWIN = 0x2;

function getSoldierById(game, id) {
  return game.world.soldiers.filter(s => s.id === id)[0];
}
