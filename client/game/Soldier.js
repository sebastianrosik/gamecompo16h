import Entity from '../lib/Entity';
import Vector2 from '../lib/Vector2';
import {getRandomName} from '../lib/generators';
import {resources} from '../resources';

import Bullet from './Bullet';

const MAX_HEALTH = 1;
const SOLDIER_WIDTH = 32;
const SOLDIER_HEIGHT = 32;

export default class Soldier extends Entity {
  constructor(x, y, {name = getRandomName(), onKill} = {}) {
    super(x, y, SOLDIER_WIDTH, SOLDIER_HEIGHT);
    this.type = 'soldier';
    this.dontCollideWith = ['bullet'];
    this.targetingEnabled = true;
    this.health = MAX_HEALTH;
    this.name = name;
    this.points = 0;
    this.onKill = onKill;
    this.killed = false;
  }

  addDamage(damage = 0.1, killerId) {
    this.health -= damage;

    if (this.health < 0) {
      this.health = 0;
    }
    if (this.health <= 0) {
      this.kill(killerId);
    }
  }

  addPoints(points = 0) {
    this.points += points;
  }

  kill(killerId) {
    if (this.parent && !this.killed) {
      this.killed = true;
      this.onKill && this.onKill(killerId);
      this.parent.remove(this);
    }
  }

  drawFrame(ctx, frameNumber) {
    ctx.save();
    let d = 1;
    let angle = this.targetAngle + Math.PI
    if (angle >= 1.7 && angle < 4.5) {
      d = -1;
    }
    ctx.scale(d, 1);
    ctx.drawImage(
      resources.image.soldier.data, 
      this.position.x * d, 
      this.position.y,
      this.size.x * d,
      this.size.y
    );
    ctx.restore();
    this.drawFlameFrame(ctx,frameNumber)
    this.drawGun(ctx,frameNumber)
  }

  drawGun(ctx,frameNumber) {
    ctx.save();
    ctx.translate(
      this.position.x + this.size.x / 2, 
      this.position.y + this.size.y / 2
    );
    ctx.rotate(this.targetAngle + Math.PI);
    ctx.translate(
      -this.position.x - this.size.x / 2, 
      -this.position.y - this.size.y / 2
    );
    ctx.drawImage(
      resources.image.gun.data,
      this.position.x, 
      this.position.y,
      this.size.x,
      this.size.y
    );
    ctx.restore();
  }

  drawFlameFrame(ctx, frameNumber) {
    return;
    let flame = resources.json.flame;

    let flameX = 18;
    let flameY = 21;
    let flameFrame = this.getJSONFrame(flame, frameNumber, 'flame');

    ctx.drawImage(
      resources.image.flame.data,
      flameFrame.x,
      flameFrame.y,
      flameFrame.w,
      flameFrame.h,
      this.position.x + flameX,
      this.position.y + flameY,
      flameFrame.w,
      flameFrame.h
    );
  }

  setState(stateData, currentId) {
    if (this.health > stateData.health) {
    this.health = stateData.health;
    }
    if (this.points > stateData.points) {
      this.points = stateData.points;
    }

    this.name = stateData.nick;
    if (this.id !== currentId) {
      this.position.x = stateData.x;
      this.position.y = stateData.y;
    }
    if (stateData.killed && !this.killed) {
      this.killed = stateData.killed;
      if (stateData.killed) {
        this.kill();
      }
    }

    if (typeof stateData.ax !== 'undefined') {
      this.acceleration.x = stateData.ax;
    }
    if (typeof stateData.ay !== 'undefined') {
      this.acceleration.y = stateData.ay;
    }
    if (typeof stateData.vx !== 'undefined') {
      this.velocity.x = stateData.vx;
    }
    if (typeof stateData.vy !== 'undefined') {
      this.velocity.y = stateData.vy;
    }

  }

  draw(ctx, frame) {
    Entity.prototype.draw.call(this, ctx, frame);
    this.drawFrame(ctx, frame);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.rect(
      this.position.x,
      this.position.y - 10,
      this.size.x,
      4
    );
    ctx.fill();
    ctx.closePath();
    ctx.fillStyle = 'green';

    ctx.beginPath();
    ctx.rect(
      this.position.x,
      this.position.y - 10,
      this.size.x * this.health,
      4
    );
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = '#fff';
    ctx.fillText(this.name, this.position.x, this.position.y - 18);
    ctx.restore();
  }

  fire(frame) {
    if (!this.parent) {
      return;
    }
    if (frame % 15 == 0) {
      let bullet = new Bullet(
        this.position.x + this.size.x / 2,
        this.position.y + this.size.y / 2,
        this.id,
        Date.now()
      );
      this.parent.bullets[bullet.id] = bullet;
      this.parent.add(bullet);
      let v = Vector2.subVecs(this.target, this.position);
      bullet.velocity.copy(v.normalize().multiplyScalar(20));
    }
  }
}
