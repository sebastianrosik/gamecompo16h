import Entity from '../lib/Entity';
import Vector2 from '../lib/Vector2';
import {getRandomName} from '../lib/generators';
import {resources} from '../resources';

import Bullet from './Bullet';

const MAX_HEALTH = 1;
const SOLDIER_WIDTH = 32;
const SOLDIER_HEIGHT = 32;

function getFrameCount(frames) {
  let c = 0;
  for (var i in frames) {
    c++;
  }
  return c;
}

function getJSONFrame(resource, frameNumber, resourceName) {
  let totalFrames = getFrameCount(resource.frames);
  let relativeFrame = frameNumber % totalFrames;
  let name = resourceName + ' ' + relativeFrame + '.ase';
  return resource[name]
}

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
    ctx.drawImage(resources.image.soldier.data, this.position.x, this.position.y);
    ctx.restore();

    let flame = resources.json.flame;

    let flameFrame = getJSONFrame(flame, frameNumber, 'flame');
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
    if (frame % 5 == 0) {
      let bullet = new Bullet(
        this.position.x + this.size.x / 2,
        this.position.y + this.size.y / 2,
        this.id,
        frame
      );
      this.parent.add(bullet);
      let v = Vector2.subVecs(this.target, this.position);
      bullet.velocity.copy(v.normalize().multiplyScalar(10));
    }
  }
}