import Entity from '../lib/Entity';
import {resources} from '../resources';

export default class Ground extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.isFixed = true
  }

  draw(ctx, frame) {
  	ctx.save();
  	ctx.drawImage(
      resources.image.ground.data,
      this.position.x, 
      this.position.y,
      this.size.x,
      this.size.y
    );
    ctx.restore();
  }
}