import Entity from '../lib/Entity';

export default class Ground extends Entity {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.isFixed = true
  }
}