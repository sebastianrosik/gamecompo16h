import Entity from '../lib/Entity';

const BULLET_LIFETIME = 60;

export default class Bullet extends Entity {
  constructor(x, y, ownerId, startFrame) {
    super(x, y, 6, 6);
    this.noGrav = true;
    this.noFriction = true;
    this.ownerId = ownerId;
    this.startFrame = startFrame;
    this.type = 'bullet';
    this.dontCollideWith = [this.type, 'soldier'];
  }

  setFrame(frame) {
    this.frame = frame;
  }

  checkLifetime(currentFrame) {
    return currentFrame - this.startFrame > BULLET_LIFETIME;
  }
}