import Entity from '../lib/Entity';
import Soldier from './Soldier';
import Ground from './Ground';

export default class JetPackGame {
  constructor({renderer, world, keyboard}) {
    this.renderer = renderer;
    this.world = world;
    this.renderer.children = this.world.children;
    this.soldiers = [new Soldier()];
    this.soldiers.forEach(soldier => this.add(soldier));
    this.keyboard = keyboard;
    this.keyboardHandler();
    this.createGround();
    this.createWalls();
  }

  createWalls() {
  }

  createGround() {
    var c = 10;
    var w = 64;
    while(c--) {
      this.add(new Ground(w * c, 300, w, w));
    }
  }

  keyboardHandler() {
    let v = 0.3;
    if (this.keyboard.up) {
      this.soldiers[0].acceleration.y -= v * 1.5;
    }
    if (this.keyboard.down) {
      this.soldiers[0].acceleration.y += v;
    }
    if (this.keyboard.left) {
      this.soldiers[0].acceleration.x -= v;
    }
    if (this.keyboard.right) {
      this.soldiers[0].acceleration.x += v;
    }
  }

  add(child) {
    this.world.add(child);
  }

  remove(child) {
    this.world.remove(child);
  }

  tick(frame) {
    this.keyboardHandler();
    this.world.tick(frame);
  }
}
