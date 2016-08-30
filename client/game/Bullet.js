import Entity from '../lib/Entity';
import {getStringId} from '../lib/generators';

const BULLET_LIFETIME = 3000;

export default class Bullet extends Entity {
  constructor(x, y, ownerId) {
    super(x, y, 6, 6);
    this.noGrav = true;
    this.noFriction = true;
    this.ownerId = ownerId;
    this.lifetime = Date.now();
    this.type = 'bullet';
    this.damagePoints = 0.1;
    this.dontCollideWith = [this.type, 'soldier'];
    this.id = this.ownerId.toString() + this.lifetime.toString() + getStringId()
  }

  checkLifetime() {
    return Date.now() - this.lifetime > BULLET_LIFETIME;
  }

  draw(ctx, frame) {
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.arc(
      this.position.x + this.size.x / 2,
      this.position.y + this.size.y / 2,
      this.size.x / 2,
      Math.PI * 2,
      0,
      false
    );
    ctx.fill();
    ctx.restore();
  }
}
