function check(vec) {
  if (typeof vec !== 'object' || typeof vec.x !== 'number' || typeof vec.y !== 'number') {
    throw 'Vector2 expected';
  }
}
export default class Vector2 {
  constructor(x = 0, y = 0) {
    this.currentX = 0;
    this.currentY = 0;
    this.previousX = 0;
    this.previousY = 0;
    Object.defineProperty(this, 'x', {
      set: function(value) {
        this.previousX = this.currentX;
        this.currentX = value;
      },
      get: function() {
        return this.currentX;
      }
    });
    Object.defineProperty(this, 'y', {
      set: function(value) {
        this.previousY = this.currentY;
        this.currentY = value;
      },
      get: function() {
        return this.currentY;
      }
    });
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    if (typeof x === 'number') {
      this.x = x;
    }
    if (typeof y === 'number') {
      this.y = y;
    }
  }
  copy(vec) {
    check(vec);
    this.x = vec.x;
    this.y = vec.y;
    return this;
  }
  add(vec) {
    check(vec);
    this.x += vec.x;
    this.y += vec.y;
    return this;
  }
  sub(vec) {
    check(vec);
    this.x -= vec.x;
    this.y -= vec.y;
    return this;
  }
  multiply(vec) {
    check(vec);
    this.x *= vec.x;
    this.y *= vec.y;
    return this;
  }
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  divide(vec) {
    check(vec);
    this.x /= vec.x;
    this.y /= vec.y;
    return this;
  }
  divideScalar(scalar) {
    var v = scalar !== 0 ? 1 / scalar : 0;
    this.x *= v;
    this.y *= v;
    return this;
  }
  min(vec) {
    check(vec);
    if (this.x > vec.x) {
      this.x = vec.x;
    }
    if (this.y > vec.y) {
      this.y = vec.y;
    }
    return this;
  }
  max(vec) {
    check(vec);
    if (this.x < vec.x) {
      this.x = vec.x;
    }
    if (this.y < vec.y) {
      this.y = vec.y;
    }
    return this;
  }
  dot(vec) {
    check(vec);
    return this.x * vec.x + this.y * vec.y;
  }
  length() {
    return Math.sqrt(this.lengthSqre());
  }
  lengthSqre() {
    return this.x * this.x + this.y * this.y;
  }
  normalize() {
    return this.divideScalar(this.length());
  }
  distanceTo(vec) {
    check(vec);
    return Math.sqrt(Math.pow(vec.x - this.x, 2) +
    Math.pow(vec.y - this.y, 2));
  }
  mag() {
    return Math.abs(Math.sqrt(Math.pow(this.x, 2) +
    Math.pow(this.y, 2)));
  }
  clamp(min, max) {
    if (this.x < min) {
      this.x = min;
    }
    else if (this.x > max) {
      this.x = max;
    }
    if (this.y < min) {
      this.y = min;
    }
    else if (this.y > max) {
      this.y = max;
    }
    return this;
  }
  limit(maxLength) {
    var lengthSquared = this.lengthSqre();
    if ((lengthSquared > maxLength * maxLength) && (lengthSquared > 0)) {
      var ratio = maxLength / Math.sqrt(lengthSquared);
      this.x *= ratio;
      this.y *= ratio;
    }
    return this;
  }
  static subVecs(vec1, vec2) {
    check(vec1);
    check(vec2);
    return new Vector2(vec1.x - vec2.x, vec1.y - vec2.y);
  }
  static addVecs(vec1, vec2) {
    check(vec1);
    check(vec2);
    return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
  }
  static multiplyVecs(vec1, vec2) {
    check(vec1);
    check(vec2);
    return new Vector2(vec1.x * vec2.x, vec1.y * vec2.y);
  }
  static dotProduct(vec1, vec2) {
    check(vec1);
    check(vec2);
    return vec2.x * vec1.x + vec2.y * vec1.y;
  }
}
