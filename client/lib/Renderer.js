import Abstract from './Abstract';

export default class Renderer extends Abstract {
  constructor({canvas}) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  resize() {
    let rect = document.body.getClientRects()[0];
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    return this;
  }

  render(frame, debug) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.children.forEach(child => child.render(this.ctx, frame, debug));
    return this;
  }
}
