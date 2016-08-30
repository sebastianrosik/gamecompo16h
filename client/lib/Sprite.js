import Abstract from './Abstract';
import Vector2 from './Vector2';

export default class Sprite extends Abstract {
  constructor(x = 0, y = 0, width = 32, height = 32) {
    super();
    this.children = [];
    this.position = new Vector2(x, y);
    this.size = new Vector2(width, height);
  }

  drawDebug(ctx, frame) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = 'magenta';
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.rect(
      this.position.x + .5, 
      this.position.y + .5, 
      this.size.x, 
      this.size.y
    );
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    let lineSize = 9;
    let cx = this.position.x + this.size.x / 2 + .5;
    let cy = this.position.y + this.size.y / 2 + .5;
    ctx.beginPath();
    ctx.moveTo(cx - lineSize, cy);
    ctx.lineTo(cx + lineSize, cy);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - lineSize);
    ctx.lineTo(cx, cy + lineSize);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  draw(ctx, frame) {}

  drawChildren(ctx, frame, debug) {
    this.children.forEach(sprite => sprite.render(ctx, frame, debug));
  }

  render(ctx, frame, debug) {
    if (debug && ctx) {
      this.drawDebug(ctx, frame);
    }

    if (ctx) {
      this.draw(ctx, frame);
      this.drawChildren(ctx, frame, debug);
    }
  }
}
