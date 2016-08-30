import Entity from '../lib/Entity';
import Vector2 from '../lib/Vector2';
import Bullet from './Bullet';

export default class Soldier extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.type = 'soldier';
    this.dontCollideWith = ['bullet'];
    this.targetingEnabled = true;
  }

  kill() {
    this.parent && this.parent.remove(this);
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