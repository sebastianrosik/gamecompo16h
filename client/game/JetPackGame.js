import Entity from '../lib/Entity';
import Soldier from './Soldier';
import Bullet from './Bullet';
import Ground from './Ground';

import {sendMsg, isConnected, readCookie} from '../communication'

const SOLDIERS = 4;
const KILL_POINTS = 100;
const SINGLE_HIT_POINTS = 1;
const BLOCK_SIZE = 32;

export default class JetPackGame {
  constructor({renderer, world, keyboard, mouse, onPoints, onState, nick}) {
    this.renderer = renderer;
    this.world = world;
    this.renderer.children = this.world.children;
    this.keyboard = keyboard;
    this.mouse = mouse;
    this.nick = nick;
    this.world.soldiers = [];
    this.world.bullets = {};
    this.createGround();
    this.createSoldiers();
    this.onPoints = onPoints;
    this.onState = onState;
    this.startSendingMessages();
    this.state = JetPackGame.STATE_GAMEPLAY;

  }

  message(msg) {
    switch(msg.type) {
      case 'state':
        // let removedBulletsIds = [];
        // for (var bulletId in this.world.bullets) {
        //   let exists = false;
        //   msg.state.bullets.forEach(bullet => {
        //     if (bulletId === bullet[4]) {
        //       exists = true;
        //     }
        //   });
        //   if (!exists) {
        //     removedBulletsIds.push(bulletId);
        //   }
        // }

        // removedBulletsIds.forEach(bulletId => {
        //   this.removeBullet(bulletId);
        // })
        
        // for (var bulletId in this.world.bullets) {
        //   this.removeBullet(bulletId);
        // }

        msg.state.bullets.forEach(bullet => {
          let x = bullet[0];
          let y = bullet[1];
          let time = bullet[2];
          let ownerId = bullet[3];
          let bulletId = bullet[4];
          let ax = bullet[5];
          let ay = bullet[6];
          let vx = bullet[7];
          let vy = bullet[8];
          this.updateBullet(x, y, time, ownerId, bulletId, ax, ay, vx, vy);
        });
        msg.state.players.forEach(player => {
          let id = player[0];
          let data = player[1];
          let soldier = getSoldierById(this, id);
          if (soldier) {
            soldier.setState(data, this.myId);
          } else {
            this.createSoldier(id, data);
          }
        })
    }
  }

  updateBullet(x, y, time, ownerId, bulletId, ax = 0, ay = 0, vx = 0, vy = 0) {
   let bullet = this.world.bullets[bulletId];
   if (!bullet) {
      this.addBullet(x, y, time, ownerId, bulletId, ax, ay, vx, vy)
    return;
   }

    if (bullet.ownerId === ownerId && bullet.lifetime == time) {
      // bullet.position.x = x;
      // bullet.position.y = y;
    }
  }

  addBullet(x, y, time, ownerId, bulletId, ax, ay, vx, vy) {
    let bullet = new Bullet(x, y, ownerId);
    bullet.id = bulletId;
    bullet.lifetime = time;
    bullet.velocity.x = vx;
    bullet.velocity.y = vy;
    bullet.acceleration.x = ax;
    bullet.acceleration.y = ay;
    this.world.bullets[bullet.id] = bullet;
    this.add(bullet);
  }

  getPlayerState() {
      return {
        health: this.myself.health,
        points: this.myself.points,
        killed: this.myself.killed,
        x: this.myself.position.x,
        y: this.myself.position.y,
        ax: this.myself.acceleration.x,
        ay: this.myself.acceleration.y,
        vx: this.myself.velocity.x,
        vy: this.myself.velocity.y
      }
  }

  getBulletsState() {
    return this.world.children
            .filter(child => {
                return child.ownerId == this.myself.id
            })
            .map(bullet => [bullet.position.x, bullet.position.y, bullet.lifetime, bullet.id, bullet.acceleration.x, bullet.acceleration.y, bullet.velocity.x, bullet.velocity.y]);
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

  createSoldier(id, data) {
    let onKill = this.onKill.bind(this);
    let soldier = new Soldier(0, 0, {onKill});
    soldier.id = id;
    data && soldier.setState(data);
    this.world.soldiers.push(soldier);
    this.add(soldier);
    this.setSoldierPosition(soldier);
    return soldier;
  } 

  setSoldierPosition(soldier) {
    soldier.position.x = Math.random() * this.world.size.x;
    soldier.position.y = 30;
  }

  createSoldiers() {
    let x = 20;
    let y = 100;
    let distance = 100;

    this.world.soldiers = new Array(SOLDIERS);
    this.myId = readCookie('jetpack');
    let soldier = this.createSoldier(this.myId, null);
    this.myself = soldier;
    this.myself.name = this.nick;
    this.world.myId = this.myId;

    // this.world.soldiers[0].position.x = 50;
    // this.world.soldiers[1].position.x = this.world.size.x - 50;

    // this.world.soldiers[2].position.x = this.world.size.x / 2 - this.world.soldiers[2].size.x / 2;
    // this.world.soldiers[2].position.y = 20;

    // this.world.soldiers[3].position.x = this.world.size.x / 2 - this.world.soldiers[3].size.x / 2;
    // this.world.soldiers[3].position.y = this.world.size.y - 100;
  }

  createPlatform(x = 0, y = 0, c = 10) {
    var w = BLOCK_SIZE;
    while(c--) {
      this.add(new Ground(x + w * c, y, w, w));
    }
  }

  createGround() {
    let c = 5;
    this.createPlatform(20, 320, c);
    let platformWidth = BLOCK_SIZE * c;
    this.createPlatform(this.world.size.x / 2 - platformWidth / 2, 120, c);
    this.createPlatform(this.world.size.x / 2 - platformWidth / 2, 400, c);
    this.createPlatform(this.world.size.x - platformWidth - 20, 320, c);
  }

  mouseHandler(frame) {
    if (this.myself.killed && this.state !== JetPackGame.STATE_GAMEPLAY) {
      return;
    }
    if (this.mouse.button[0]) {
      this.myself.fire(frame);
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

    if (!isConnected()) {
      this.setGameOver();
    }
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

  eachBullet(cb) {
    this.world.children.forEach(child => {
      if (child instanceof Bullet) {
        cb(child);
      }
    });
  }

  removeBullet(id)
 {
  let bullet = this.world.bullets[id];
  bullet.parent && bullet.parent.remove(bullet);
  delete this.world.bullets[id]
 }
  handleBulltes(frame) {
    let soldiers = this.world.soldiers.filter(s => !s.killed);
    this.eachBullet(child => {
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
              delete this.world.bullets[child.id];
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
