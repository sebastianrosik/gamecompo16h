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
}
