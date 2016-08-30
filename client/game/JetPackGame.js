import Entity from '../lib/Entity';
import Soldier from './Soldier';
import Bullet from './Bullet';
import Ground from './Ground';

const SOLDIERS = 4;

export default class JetPackGame {
  constructor({renderer, world, keyboard, mouse}) {
    this.renderer = renderer;
    this.world = world;
    this.renderer.children = this.world.children;
    this.keyboard = keyboard;
    this.mouse = mouse;
    this.createGround();
    this.createSoldiers();
  }

  createSoldiers() {
    this.soldiers = [];
    let x = 20;
    let y = 100;
    let distance = 100;
    for (let i = 0; i < SOLDIERS; ++i) {
      this.soldiers.push(new Soldier(i * distance, y))
    }
    this.soldiers.forEach(soldier => this.add(soldier));
    this.myself = this.soldiers[0];
  }

  createGround() {
    var c = 10;
    var w = 64;
    while(c--) {
      this.add(new Ground(w * c, 300, w, w));
    }
  }

  mouseHandler(frame) {
    if (this.mouse.button[0]) {
      this.soldiers[0].fire(frame);
    }
    this.myself.setTarget(this.mouse);
  }

  keyboardHandler(frame) {
    let v = 0.3;
    if (this.keyboard.up || this.keyboard.w) {
      this.soldiers[0].acceleration.y -= v * 1.5;
    }
    if (this.keyboard.down  || this.keyboard.s) {
      this.soldiers[0].acceleration.y += v;
    }
    if (this.keyboard.left || this.keyboard.a) {
      this.soldiers[0].acceleration.x -= v;
    }
    if (this.keyboard.right || this.keyboard.d) {
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
    this.keyboardHandler(frame);
    this.mouseHandler(frame);
    this.world.tick(frame);
    this.handleBulltes(frame);
  }

  handleBulltes(frame) {
    let soldiers = this.soldiers;
    this.world.children.forEach(child => {
      if (child instanceof Bullet) {
        if (child.checkLifetime(frame)) {
          this.world.remove(child);
        }
        for (let n = 0; n < soldiers.length; ++n) {
          if (child.ownerId !== soldiers[n].id) {
            let collision = this.world.getCollision(child, soldiers[n]);
            if (collision.x && collision.y) {
              soldiers[n].kill();
            }
          }
        }
      }
    });
  }
}
