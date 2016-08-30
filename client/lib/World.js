import Abstract from './Abstract';
import Vector2 from './Vector2';

function CCW(p1, p2, p3) {
  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
}

export default class World extends Abstract {
  constructor(width, height) {
    super();
    this.friction = 0.975;
    this.gravity = new Vector2(0, 0.2);
    this.size = new Vector2(width, height);
    this.position = new Vector2;
  }
  
  linesAreIntersecting(p1, p2, p3, p4) {
    return (CCW(p1, p3, p4) != CCW(p2, p3, p4)) && (CCW(p1, p2, p3) != CCW(p1, p2, p4));
  }

  resolveCollision(entityA, entityB, collision) {
      var normal = new Vector2;
      var n = new Vector2(
        (entityB.position.x + entityB.size.x / 2) - (entityA.position.x + entityA.size.x / 2),
        (entityB.position.y + entityB.size.y / 2) - (entityA.position.y + entityA.size.y / 2)
      );

      // Calculate relative velocity
      var rv = Vector2.subVecs(entityB.velocity, entityA.velocity);

      let directionAX = entityA.velocity.previousX - entityA.velocity.currentX; 
      let directionAY = entityA.velocity.previousY - entityA.velocity.currentY; 
      let directionBX = entityB.velocity.previousX - entityB.velocity.currentX; 
      let directionBY = entityB.velocity.previousY - entityB.velocity.currentY; 
    
      let towardsOnX = (directionAX >= 0 && directionBX <= 0 && collision.left) || (directionAX <= 0 && directionBX >= 0 && collision.right);
      let towardsOnY = (directionAY >= 0 && directionBY <= 0 && collision.top) || (directionAY <= 0 && directionBY >= 0 && collision.bottom);

      if (Math.abs(n.x) > Math.abs(n.y)) {
        if (n.x < n.y) {
          normal = new Vector2(-1, 0);
        } else {
          normal = new Vector2(1, 0)
        }
      } else {
        if (n.x < n.y) {
          normal = new Vector2(0, 1);
        } else {
          normal = new Vector2(0, -1)
        }
      }

      // Calculate relative velocity in terms of the normal direction
      var velAlongNormal = Vector2.dotProduct(rv, normal);
      if(velAlongNormal > 0) {
        return;
      }
      // Calculate restitution
      var e = Math.min(entityA.restitution, entityB.restitution);
      // Calculate impulse scalar
      var j  = -(1 + e) * velAlongNormal;
      
      j /= 1 / entityA.mass + 1 / entityB.mass;

      // Apply impulse
      var impulse = new Vector2(j * normal.x, j * normal.y);

      if (!entityA.isFixed) {
        entityA.velocity.sub({
          x : 1 / entityA.mass * impulse.x,
          y : 1 / entityA.mass * impulse.y 
        });
      }
      
      if (!entityB.isFixed) {
        entityB.velocity.add({
          x : 1 / entityB.mass * impulse.x, 
          y : 1 / entityB.mass * impulse.y 
        });
      }
  }

  getCollision(entityA, entityB) {
    let top = entityA.position.y + entityA.size.y >= entityB.position.y && entityA.position.y + entityA.size.y <= entityB.position.y + entityB.size.y / 2;
    let bottom = entityA.position.y + entityA.size.y >= entityB.position.y + entityB.size.y / 2 && entityA.position.y <= entityB.position.y + entityB.size.y;
    let left = entityA.position.x + entityA.size.x >= entityB.position.x && entityA.position.x + entityA.size.x <= entityB.position.x + entityB.size.x / 2;
    let right = entityA.position.x + entityA.size.x >= entityB.position.x + entityB.size.x / 2 && entityA.position.x <= entityB.position.x + entityB.size.x;
    let x = left || right;
    let y = top || bottom;
    return {
      x, y, top, left, bottom, right
    }
  }
  
  tick(frame) {
    for (let i = 0, l = this.children.length; i < l; ++i) {
      let entity = this.children[i];
      entity.velocity.add(entity.acceleration);

      if (!entity.isFixed && !entity.noGrav) {
        entity.velocity.add(this.gravity);
      }

      if (!entity.noFriction) {
        entity.velocity.multiplyScalar(this.friction);
      }
      entity.velocity.clamp(-entity.maxSpeed, entity.maxSpeed);
      entity.acceleration.multiplyScalar(0);

      let insideWorld = this.getCollision(entity, this);

      if (!insideWorld.x || !insideWorld.y) {
        if (entity.type == 'soldier') {
          entity.kill();
        } else {
          this.remove(entity);
        }
        return;
      }

      if (!entity.isFixed) {
        var entities = entity.parent.children;
        var collision;
        for (var n in entities) {
            if (entity.canCollide(entities[n])) {
              collision = this.getCollision(entity, entities[n]);
              if (collision.x && collision.y) {
                this.resolveCollision(entity, entities[n], collision);
              }
            }
        }
      }
      entity.position.add(entity.velocity);
    }
  }
}