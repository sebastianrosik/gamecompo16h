import Sprite from './Sprite';
import Vector2 from './Vector2';

export default class Entity extends Sprite {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.acceleration = new Vector2();
    this.velocity = new Vector2();
    this.target = new Vector2();
    this.maxSpeed = 10;
    this.restitution = 1.75;
    this.mass = 1;
    this.rotation = 0;
    this.isFixed = false;
    this.targetingEnabled = false;
    this.type = 'entity';
    this.dontCollideWith = [];
    this.targetAngle = 0;
  }

  getTargetAngle() {
    return  Math.atan2(this.target.y - this.position.y, this.target.x - this.position.x);
  }

  canCollide(entity) {
    return entity.id !== this.id && this.dontCollideWith.indexOf(entity.type) == -1;
  }

  drawDebug(ctx, frame) {
    Sprite.prototype.drawDebug.call(this, ctx, frame);
    if (this.targetingEnabled) {
      let cx = this.position.x + this.size.x / 2;
      let cy = this.position.y + this.size.y / 2;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      let radius = 12;
      let x = cx + Math.cos(this.targetAngle) * radius;
      let y = cy + Math.sin(this.targetAngle) * radius;
      ctx.arc(
        x,
        y,
        3,
        0,
        Math.PI * 2,
        false
      );
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }
  }

  move(x = 0, y = 0) {
    this.acceleration.set(x, y);
  }

  moveLeft() {
    this.move(-4, 0);
  }

  moveUp() {
    this.move(0, -4);
  }

  moveRight() {
    this.move(4, 0);
  }

  moveDown() {
    this.move(0, 4);
  }

  setTarget(vec) {
    this.target.copy(vec);
    this.targetAngle = this.getTargetAngle();
  }
}
