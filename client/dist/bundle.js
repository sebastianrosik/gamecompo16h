/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Renderer = __webpack_require__(1);
	
	var _Renderer2 = _interopRequireDefault(_Renderer);
	
	var _Vector = __webpack_require__(4);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	var _World = __webpack_require__(5);
	
	var _World2 = _interopRequireDefault(_World);
	
	var _input = __webpack_require__(6);
	
	var _communication = __webpack_require__(7);
	
	var _resources = __webpack_require__(8);
	
	var _JetPackGame = __webpack_require__(9);
	
	var _JetPackGame2 = _interopRequireDefault(_JetPackGame);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	window.PLAYER_NICK = "foobar";
	window.GAME_ID = "gameid0123";
	
	var canvas = document.createElement('canvas');
	var game,
	    renderer,
	    world,
	    token,
	    frame = 0;
	var debug = true;
	var offset = new _Vector2.default();
	
	function renderSoldierInfo(soldier) {
	  var li = document.createElement('li');
	  var percentage = soldier.health * 100;
	  li.innerHTML = '\n    <strong>' + soldier.name + '</strong>\n    <span class="health">\n     <span class="health-bar" style="width:' + percentage + '%"></span> \n    </span>\n    <div class="points">Points: ' + (soldier.points || 0) + '</div>\n  ';
	  if (soldier.killed) {
	    li.classList.add('killed');
	  }
	  return li;
	}
	
	function _onPoints(soldier, points, game) {
	  createInfo(game);
	}
	
	function createInfo(game) {
	  var info = document.getElementById('info');
	  info.innerHTML = '';
	  var rows = [].concat(game.world.soldiers).sort(function (a, b) {
	    if (a.points < b.points) {
	      return 1;
	    }
	    if (a.points > b.points) {
	      return -1;
	    }
	  }).map(function (soldier) {
	    return renderSoldierInfo(soldier);
	  });
	  rows.forEach(function (row) {
	    return info.appendChild(row);
	  });
	}
	
	function init() {
	  canvas.width = 680;
	  canvas.height = 460;
	  document.getElementById('canvas').appendChild(canvas);
	  renderer = new _Renderer2.default({ canvas: canvas });
	  world = new _World2.default();
	  game = new _JetPackGame2.default({ world: world, renderer: renderer, keyboard: _input.keyboard, mouse: _input.mouse, onPoints: function onPoints(soldier, points) {
	      _onPoints(soldier, points, game);
	    } });
	  calcOffset();
	  cancelAnimationFrame(token);
	  loop();
	  createInfo(game);
	  window.game = game;
	}
	
	function loop() {
	  frame++;
	  _input.mouse.setOffset(offset);
	  game.tick(frame);
	  renderer.render(frame, debug);
	  token = requestAnimationFrame(loop);
	}
	
	function calcOffset() {
	  var rect = canvas.getClientRects()[0];
	  if (rect) {
	    offset.x = rect.left;
	    offset.y = rect.top;
	  }
	}
	
	function resize() {
	  calcOffset();
	}
	
	window.addEventListener('load', function () {
	  (0, _communication.connect)(function () {
	    console.log('CONNECTED');
	    (0, _communication.sendMsg)({
	      type: "ready",
	      nick: window.PLAYER_NICK,
	      game: window.GAME_ID
	    });
	    _resources.resources.load(init);
	  });
	});
	window.addEventListener('resize', resize);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Abstract2 = __webpack_require__(2);
	
	var _Abstract3 = _interopRequireDefault(_Abstract2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Renderer = function (_Abstract) {
	  _inherits(Renderer, _Abstract);
	
	  function Renderer(_ref) {
	    var canvas = _ref.canvas;
	
	    _classCallCheck(this, Renderer);
	
	    var _this = _possibleConstructorReturn(this, (Renderer.__proto__ || Object.getPrototypeOf(Renderer)).call(this));
	
	    _this.canvas = canvas;
	    _this.ctx = canvas.getContext('2d');
	    _this.resize();
	    return _this;
	  }
	
	  _createClass(Renderer, [{
	    key: 'resize',
	    value: function resize() {
	      var rect = document.body.getClientRects()[0];
	      this.canvas.width = rect.width;
	      this.canvas.height = rect.height;
	      return this;
	    }
	  }, {
	    key: 'render',
	    value: function render(frame, debug) {
	      var _this2 = this;
	
	      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	      this.children.forEach(function (child) {
	        return child.render(_this2.ctx, frame, debug);
	      });
	      return this;
	    }
	  }]);
	
	  return Renderer;
	}(_Abstract3.default);
	
	exports.default = Renderer;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _generators = __webpack_require__(3);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Abstract = function () {
	  function Abstract() {
	    _classCallCheck(this, Abstract);
	
	    this.id = (0, _generators.getNextId)();
	    this.children = [];
	  }
	
	  _createClass(Abstract, [{
	    key: 'add',
	    value: function add(child) {
	      child.parent = this;
	      this.children.unshift(child);
	    }
	  }, {
	    key: 'remove',
	    value: function remove(child) {
	      var index = this.children.indexOf(child);
	      child.parent = undefined;
	      this.children.splice(index, 1);
	    }
	  }]);
	
	  return Abstract;
	}();
	
	exports.default = Abstract;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.getNextId = getNextId;
	exports.getRandomName = getRandomName;
	var ids = 0;
	
	function getNextId() {
	  return ids++;
	}
	
	var firstNames = ['Barbara', 'Alojzy', 'Hermenegilda', 'Ambrozja', 'Grafira', 'Glazuria', 'Gleb', 'Zbylut', 'Majkiel', 'Fabrycjo'];
	
	var lastNames = ['Nowak', 'Kowalski', 'Miksa', 'Szymkowskyy', 'Koldwind'];
	
	function getRandomName() {
	  return firstNames[Math.round(Math.random() * (firstNames.length - 1))] + ' ' + lastNames[Math.round(Math.random() * (lastNames.length - 1))];
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function check(vec) {
	  if ((typeof vec === 'undefined' ? 'undefined' : _typeof(vec)) !== 'object' || typeof vec.x !== 'number' || typeof vec.y !== 'number') {
	    throw 'Vector2 expected';
	  }
	}
	
	var Vector2 = function () {
	  function Vector2() {
	    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	    _classCallCheck(this, Vector2);
	
	    this.currentX = 0;
	    this.currentY = 0;
	    this.previousX = 0;
	    this.previousY = 0;
	    Object.defineProperty(this, 'x', {
	      set: function set(value) {
	        this.previousX = this.currentX;
	        this.currentX = value;
	      },
	      get: function get() {
	        return this.currentX;
	      }
	    });
	    Object.defineProperty(this, 'y', {
	      set: function set(value) {
	        this.previousY = this.currentY;
	        this.currentY = value;
	      },
	      get: function get() {
	        return this.currentY;
	      }
	    });
	    this.x = x;
	    this.y = y;
	  }
	
	  _createClass(Vector2, [{
	    key: 'set',
	    value: function set(x, y) {
	      if (typeof x === 'number') {
	        this.x = x;
	      }
	      if (typeof y === 'number') {
	        this.y = y;
	      }
	    }
	  }, {
	    key: 'copy',
	    value: function copy(vec) {
	      check(vec);
	      this.x = vec.x;
	      this.y = vec.y;
	      return this;
	    }
	  }, {
	    key: 'add',
	    value: function add(vec) {
	      check(vec);
	      this.x += vec.x;
	      this.y += vec.y;
	      return this;
	    }
	  }, {
	    key: 'sub',
	    value: function sub(vec) {
	      check(vec);
	      this.x -= vec.x;
	      this.y -= vec.y;
	      return this;
	    }
	  }, {
	    key: 'multiply',
	    value: function multiply(vec) {
	      check(vec);
	      this.x *= vec.x;
	      this.y *= vec.y;
	      return this;
	    }
	  }, {
	    key: 'multiplyScalar',
	    value: function multiplyScalar(scalar) {
	      this.x *= scalar;
	      this.y *= scalar;
	      return this;
	    }
	  }, {
	    key: 'divide',
	    value: function divide(vec) {
	      check(vec);
	      this.x /= vec.x;
	      this.y /= vec.y;
	      return this;
	    }
	  }, {
	    key: 'divideScalar',
	    value: function divideScalar(scalar) {
	      var v = scalar !== 0 ? 1 / scalar : 0;
	      this.x *= v;
	      this.y *= v;
	      return this;
	    }
	  }, {
	    key: 'min',
	    value: function min(vec) {
	      check(vec);
	      if (this.x > vec.x) {
	        this.x = vec.x;
	      }
	      if (this.y > vec.y) {
	        this.y = vec.y;
	      }
	      return this;
	    }
	  }, {
	    key: 'max',
	    value: function max(vec) {
	      check(vec);
	      if (this.x < vec.x) {
	        this.x = vec.x;
	      }
	      if (this.y < vec.y) {
	        this.y = vec.y;
	      }
	      return this;
	    }
	  }, {
	    key: 'dot',
	    value: function dot(vec) {
	      check(vec);
	      return this.x * vec.x + this.y * vec.y;
	    }
	  }, {
	    key: 'length',
	    value: function length() {
	      return Math.sqrt(this.lengthSqre());
	    }
	  }, {
	    key: 'lengthSqre',
	    value: function lengthSqre() {
	      return this.x * this.x + this.y * this.y;
	    }
	  }, {
	    key: 'normalize',
	    value: function normalize() {
	      return this.divideScalar(this.length());
	    }
	  }, {
	    key: 'distanceTo',
	    value: function distanceTo(vec) {
	      check(vec);
	      return Math.sqrt(Math.pow(vec.x - this.x, 2) + Math.pow(vec.y - this.y, 2));
	    }
	  }, {
	    key: 'mag',
	    value: function mag() {
	      return Math.abs(Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
	    }
	  }, {
	    key: 'clamp',
	    value: function clamp(min, max) {
	      if (this.x < min) {
	        this.x = min;
	      } else if (this.x > max) {
	        this.x = max;
	      }
	      if (this.y < min) {
	        this.y = min;
	      } else if (this.y > max) {
	        this.y = max;
	      }
	      return this;
	    }
	  }, {
	    key: 'limit',
	    value: function limit(maxLength) {
	      var lengthSquared = this.lengthSqre();
	      if (lengthSquared > maxLength * maxLength && lengthSquared > 0) {
	        var ratio = maxLength / Math.sqrt(lengthSquared);
	        this.x *= ratio;
	        this.y *= ratio;
	      }
	      return this;
	    }
	  }], [{
	    key: 'subVecs',
	    value: function subVecs(vec1, vec2) {
	      check(vec1);
	      check(vec2);
	      return new Vector2(vec1.x - vec2.x, vec1.y - vec2.y);
	    }
	  }, {
	    key: 'addVecs',
	    value: function addVecs(vec1, vec2) {
	      check(vec1);
	      check(vec2);
	      return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
	    }
	  }, {
	    key: 'multiplyVecs',
	    value: function multiplyVecs(vec1, vec2) {
	      check(vec1);
	      check(vec2);
	      return new Vector2(vec1.x * vec2.x, vec1.y * vec2.y);
	    }
	  }, {
	    key: 'dotProduct',
	    value: function dotProduct(vec1, vec2) {
	      check(vec1);
	      check(vec2);
	      return vec2.x * vec1.x + vec2.y * vec1.y;
	    }
	  }]);
	
	  return Vector2;
	}();
	
	exports.default = Vector2;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Abstract2 = __webpack_require__(2);
	
	var _Abstract3 = _interopRequireDefault(_Abstract2);
	
	var _Vector = __webpack_require__(4);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function CCW(p1, p2, p3) {
	  return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
	}
	
	var World = function (_Abstract) {
	  _inherits(World, _Abstract);
	
	  function World() {
	    _classCallCheck(this, World);
	
	    var _this = _possibleConstructorReturn(this, (World.__proto__ || Object.getPrototypeOf(World)).call(this));
	
	    _this.friction = 0.975;
	    _this.gravity = new _Vector2.default(0, 0.2);
	    return _this;
	  }
	
	  _createClass(World, [{
	    key: 'linesAreIntersecting',
	    value: function linesAreIntersecting(p1, p2, p3, p4) {
	      return CCW(p1, p3, p4) != CCW(p2, p3, p4) && CCW(p1, p2, p3) != CCW(p1, p2, p4);
	    }
	  }, {
	    key: 'resolveCollision',
	    value: function resolveCollision(entityA, entityB, collision) {
	      var normal = new _Vector2.default();
	      var n = new _Vector2.default(entityB.position.x + entityB.size.x / 2 - (entityA.position.x + entityA.size.x / 2), entityB.position.y + entityB.size.y / 2 - (entityA.position.y + entityA.size.y / 2));
	
	      // Calculate relative velocity
	      var rv = _Vector2.default.subVecs(entityB.velocity, entityA.velocity);
	
	      var directionAX = entityA.velocity.previousX - entityA.velocity.currentX;
	      var directionAY = entityA.velocity.previousY - entityA.velocity.currentY;
	      var directionBX = entityB.velocity.previousX - entityB.velocity.currentX;
	      var directionBY = entityB.velocity.previousY - entityB.velocity.currentY;
	
	      var towardsOnX = directionAX >= 0 && directionBX <= 0 && collision.left || directionAX <= 0 && directionBX >= 0 && collision.right;
	      var towardsOnY = directionAY >= 0 && directionBY <= 0 && collision.top || directionAY <= 0 && directionBY >= 0 && collision.bottom;
	
	      if (Math.abs(n.x) > Math.abs(n.y)) {
	        if (n.x < n.y) {
	          normal = new _Vector2.default(-1, 0);
	        } else {
	          normal = new _Vector2.default(1, 0);
	        }
	      } else {
	        if (n.x < n.y) {
	          normal = new _Vector2.default(0, 1);
	        } else {
	          normal = new _Vector2.default(0, -1);
	        }
	      }
	
	      // Calculate relative velocity in terms of the normal direction
	      var velAlongNormal = _Vector2.default.dotProduct(rv, normal);
	      if (velAlongNormal > 0) {
	        return;
	      }
	      // Calculate restitution
	      var e = Math.min(entityA.restitution, entityB.restitution);
	      // Calculate impulse scalar
	      var j = -(1 + e) * velAlongNormal;
	
	      j /= 1 / entityA.mass + 1 / entityB.mass;
	
	      // Apply impulse
	      var impulse = new _Vector2.default(j * normal.x, j * normal.y);
	
	      if (!entityA.isFixed) {
	        entityA.velocity.sub({
	          x: 1 / entityA.mass * impulse.x,
	          y: 1 / entityA.mass * impulse.y
	        });
	      }
	
	      if (!entityB.isFixed) {
	        entityB.velocity.add({
	          x: 1 / entityB.mass * impulse.x,
	          y: 1 / entityB.mass * impulse.y
	        });
	      }
	    }
	  }, {
	    key: 'getCollision',
	    value: function getCollision(entityA, entityB) {
	      var top = entityA.position.y + entityA.size.y >= entityB.position.y && entityA.position.y + entityA.size.y <= entityB.position.y + entityB.size.y / 2;
	      var bottom = entityA.position.y + entityA.size.y >= entityB.position.y + entityB.size.y / 2 && entityA.position.y <= entityB.position.y + entityB.size.y;
	      var left = entityA.position.x + entityA.size.x >= entityB.position.x && entityA.position.x + entityA.size.x <= entityB.position.x + entityB.size.x / 2;
	      var right = entityA.position.x + entityA.size.x >= entityB.position.x + entityB.size.x / 2 && entityA.position.x <= entityB.position.x + entityB.size.x;
	      var x = left || right;
	      var y = top || bottom;
	      return {
	        x: x, y: y, top: top, left: left, bottom: bottom, right: right
	      };
	    }
	  }, {
	    key: 'tick',
	    value: function tick(frame) {
	      for (var i = 0, l = this.children.length; i < l; ++i) {
	        var entity = this.children[i];
	        entity.velocity.add(entity.acceleration);
	
	        if (!entity.isFixed && !entity.noGrav) {
	          entity.velocity.add(this.gravity);
	        }
	
	        if (!entity.noFriction) {
	          entity.velocity.multiplyScalar(this.friction);
	        }
	        entity.velocity.clamp(-entity.maxSpeed, entity.maxSpeed);
	        entity.acceleration.multiplyScalar(0);
	
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
	  }]);
	
	  return World;
	}(_Abstract3.default);
	
	exports.default = World;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var KEYS = {
	  8: 'backspace',
	  9: 'tab',
	  13: 'enter',
	  32: 'space',
	  37: 'left',
	  38: 'up',
	  39: 'right',
	  40: 'down',
	  87: 'w',
	  83: 's',
	  65: 'a',
	  68: 'd',
	  88: 'x',
	  89: 'y',
	  90: 'z'
	};
	
	function getKeyName(keyCode) {
	  return KEYS[keyCode] || null;
	}
	
	var oldX = 0,
	    oldY = 0;
	var offsetX = 0,
	    offsetY = 0;
	
	window.addEventListener('mousemove', function (e) {
	  oldX = mouse.x;
	  oldY = mouse.y;
	  mouse.x = e.pageX - offsetX;
	  mouse.y = e.pageY - offsetY;
	  mouse.dx = oldX - mouse.x;
	  mouse.dy = oldY - mouse.y;
	});
	
	var mouse = exports.mouse = {
	  button: [false, false, false],
	  x: 0,
	  y: 0,
	  dx: 0,
	  dy: 0,
	  setOffset: function setOffset(offset) {
	    offsetX = offset.x;
	    offsetY = offset.y;
	  }
	};
	
	var keyboard = exports.keyboard = {};
	
	for (var n in KEYS) {
	  keyboard[KEYS[n]] = false;
	}
	
	window.addEventListener('keydown', function (e) {
	  var keyCode = e.which || e.keyCode;
	  keyboard[getKeyName(keyCode)] = true;
	});
	
	window.addEventListener('keyup', function (e) {
	  var keyCode = e.which || e.keyCode;
	  keyboard[getKeyName(keyCode)] = false;
	});
	
	window.addEventListener('mousedown', function (e) {
	  mouse.button[e.button] = true;
	});
	
	window.addEventListener('mouseup', function (e) {
	  mouse.button[e.button] = false;
	});

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.connect = connect;
	exports.sendMsg = sendMsg;
	
	function readCookie(name) {
	  var c = document.cookie.split(';');
	  for (var i = 0; i < c.length; ++i) {
	    var item = c[i].trim();
	    var cookie = item.split('=');
	    cookie[0] = cookie[0].trim();
	    cookie[1] = decodeURIComponent(cookie[1].trim());
	    if (cookie[0] == name) {
	      return cookie[1];
	    }
	  }
	}
	var ws = readCookie('ws');
	var jetpack = readCookie('jetpack');
	
	var socket = void 0;
	
	function connect(cb) {
	  var onMsg = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];
	
	  socket = new WebSocket('ws://' + (ws || 'localhost'), jetpack || 'abc');
	
	  socket.onopen = function () {
	    cb();
	  };
	
	  socket.onmessage = function (msgraw) {
	    onMsg(JSON.parse(msgraw.data));
	  };
	}
	
	function sendMsg(msg) {
	  socket.send(JSON.stringify(msg));
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var resources = exports.resources = {
	  image: {},
	  json: {},
	  load: function load(callback) {
	    files.forEach(function (file) {
	      loadJSON('./' + file + '.json', function (json) {
	        resources.json[file] = { data: json, name: file };
	        loaded++;
	        check(callback);
	      });
	      loadImage('./' + file + '.png', function (image) {
	        resources.image[file] = { data: image, name: file };
	        loaded++;
	        check(callback);
	      });
	    });
	  }
	};
	
	function loadJSON(file, callback) {
	  var xhr = new XMLHttpRequest();
	  xhr.open('GET', file, true);
	  xhr.send(null);
	  xhr.onreadystatechange = function () {
	    if (xhr.readyState == 4) {
	      callback(JSON.parse(xhr.response));
	    }
	  };
	}
	
	function loadImage(file, callback) {
	  var image = new Image();
	  image.onload = function () {
	    callback(image);
	  };
	  image.src = file;
	}
	
	var files = ['flame', 'soldier'];
	var loaded = 0;
	var total = files.length * 2;
	
	function check(cb) {
	  if (total <= loaded) {
	    cb();
	  }
	}
	
	window.resources = resources;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Entity = __webpack_require__(10);
	
	var _Entity2 = _interopRequireDefault(_Entity);
	
	var _Soldier = __webpack_require__(12);
	
	var _Soldier2 = _interopRequireDefault(_Soldier);
	
	var _Bullet = __webpack_require__(13);
	
	var _Bullet2 = _interopRequireDefault(_Bullet);
	
	var _Ground = __webpack_require__(14);
	
	var _Ground2 = _interopRequireDefault(_Ground);
	
	var _communication = __webpack_require__(7);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SOLDIERS = 4;
	var KILL_POINTS = 100;
	var SINGLE_HIT_POINTS = 1;
	
	var JetPackGame = function () {
	  function JetPackGame(_ref) {
	    var renderer = _ref.renderer;
	    var world = _ref.world;
	    var keyboard = _ref.keyboard;
	    var mouse = _ref.mouse;
	    var onPoints = _ref.onPoints;
	
	    _classCallCheck(this, JetPackGame);
	
	    this.renderer = renderer;
	    this.world = world;
	    this.renderer.children = this.world.children;
	    this.keyboard = keyboard;
	    this.mouse = mouse;
	    this.createGround();
	    this.createSoldiers();
	    this.onPoints = onPoints;
	    this.startSendingMessages();
	  }
	
	  _createClass(JetPackGame, [{
	    key: 'getPlayerState',
	    value: function getPlayerState(soldier) {}
	  }, {
	    key: 'getBulletsState',
	    value: function getBulletsState(soldier) {
	      var _this = this;
	
	      return this.world.children.filter(function (child) {
	        return child.ownerId == _this.myself.id;
	      }).map(function (bullet) {
	        return [bullet.x, bullet.y, bullet.lifetime];
	      });
	    }
	  }, {
	    key: 'getMessagePayload',
	    value: function getMessagePayload() {
	      return {
	        type: "state",
	        player: this.getPlayerState(),
	        bullets: this.getBulletsState()
	      };
	    }
	  }, {
	    key: 'startSendingMessages',
	    value: function startSendingMessages() {
	      var _this2 = this;
	
	      setInterval(function () {
	        (0, _communication.sendMsg)(_this2.getMessagePayload());
	      }, 1000); //1000 / 16);
	    }
	  }, {
	    key: 'createSoldiers',
	    value: function createSoldiers() {
	      var _this3 = this;
	
	      this.world.soldiers = [];
	      var x = 20;
	      var y = 100;
	      var distance = 100;
	      var onKill = this.onKill.bind(this);
	      for (var i = 0; i < SOLDIERS; ++i) {
	        var soldier = new _Soldier2.default(i * distance, y, { onKill: onKill });
	        this.world.soldiers.push(soldier);
	      }
	      this.world.soldiers.forEach(function (soldier) {
	        return _this3.add(soldier);
	      });
	      this.myself = this.world.soldiers[0];
	    }
	  }, {
	    key: 'createGround',
	    value: function createGround() {
	      var c = 10;
	      var w = 64;
	      while (c--) {
	        this.add(new _Ground2.default(w * c, 300, w, w));
	      }
	    }
	  }, {
	    key: 'mouseHandler',
	    value: function mouseHandler(frame) {
	      if (this.mouse.button[0]) {
	        this.world.soldiers[0].fire(frame);
	      }
	      this.myself.setTarget(this.mouse);
	    }
	  }, {
	    key: 'keyboardHandler',
	    value: function keyboardHandler(frame) {
	      var v = 0.3;
	      if (this.keyboard.up || this.keyboard.w) {
	        this.world.soldiers[0].acceleration.y -= v * 1.5;
	      }
	      if (this.keyboard.down || this.keyboard.s) {
	        this.world.soldiers[0].acceleration.y += v;
	      }
	      if (this.keyboard.left || this.keyboard.a) {
	        this.world.soldiers[0].acceleration.x -= v;
	      }
	      if (this.keyboard.right || this.keyboard.d) {
	        this.world.soldiers[0].acceleration.x += v;
	      }
	    }
	  }, {
	    key: 'add',
	    value: function add(child) {
	      this.world.add(child);
	    }
	  }, {
	    key: 'remove',
	    value: function remove(child) {
	      this.world.remove(child);
	    }
	  }, {
	    key: 'tick',
	    value: function tick(frame) {
	      this.keyboardHandler(frame);
	      this.mouseHandler(frame);
	      this.world.tick(frame);
	      this.handleBulltes(frame);
	    }
	  }, {
	    key: 'addPoints',
	    value: function addPoints(soldier, points) {
	      soldier.addPoints(points);
	      this.onPoints(soldier, points);
	    }
	  }, {
	    key: 'onKill',
	    value: function onKill(killerId) {
	      var soldier = getSoldierById(this, killerId);
	      this.addPoints(soldier, KILL_POINTS);
	    }
	  }, {
	    key: 'handleBulltes',
	    value: function handleBulltes(frame) {
	      var _this4 = this;
	
	      var soldiers = this.world.soldiers.filter(function (s) {
	        return !s.killed;
	      });
	      this.world.children.forEach(function (child) {
	        if (child instanceof _Bullet2.default) {
	          if (child.checkLifetime(frame)) {
	            _this4.world.remove(child);
	          }
	          for (var n = 0; n < soldiers.length; ++n) {
	            if (child.ownerId !== soldiers[n].id) {
	              var collision = _this4.world.getCollision(child, soldiers[n]);
	              if (collision.x && collision.y) {
	                _this4.addPoints(getSoldierById(_this4, child.ownerId), SINGLE_HIT_POINTS);
	                soldiers[n].addDamage(child.damagePoints, child.ownerId);
	                _this4.world.remove(child);
	              }
	            }
	          }
	        }
	      });
	    }
	  }]);
	
	  return JetPackGame;
	}();
	
	exports.default = JetPackGame;
	
	
	function getSoldierById(game, id) {
	  return game.world.soldiers.filter(function (s) {
	    return s.id === id;
	  })[0];
	}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Sprite2 = __webpack_require__(11);
	
	var _Sprite3 = _interopRequireDefault(_Sprite2);
	
	var _Vector = __webpack_require__(4);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Entity = function (_Sprite) {
	  _inherits(Entity, _Sprite);
	
	  function Entity(x, y, width, height) {
	    _classCallCheck(this, Entity);
	
	    var _this = _possibleConstructorReturn(this, (Entity.__proto__ || Object.getPrototypeOf(Entity)).call(this, x, y, width, height));
	
	    _this.acceleration = new _Vector2.default();
	    _this.velocity = new _Vector2.default();
	    _this.target = new _Vector2.default();
	    _this.maxSpeed = 10;
	    _this.restitution = 1.75;
	    _this.mass = 1;
	    _this.rotation = 0;
	    _this.isFixed = false;
	    _this.targetingEnabled = false;
	    _this.type = 'entity';
	    _this.dontCollideWith = [];
	    _this.targetAngle = 0;
	    return _this;
	  }
	
	  _createClass(Entity, [{
	    key: 'getTargetAngle',
	    value: function getTargetAngle() {
	      return Math.atan2(this.target.y - this.position.y, this.target.x - this.position.x);
	    }
	  }, {
	    key: 'canCollide',
	    value: function canCollide(entity) {
	      return entity.id !== this.id && this.dontCollideWith.indexOf(entity.type) == -1;
	    }
	  }, {
	    key: 'drawDebug',
	    value: function drawDebug(ctx, frame) {
	      _Sprite3.default.prototype.drawDebug.call(this, ctx, frame);
	      if (this.targetingEnabled) {
	        var cx = this.position.x + this.size.x / 2;
	        var cy = this.position.y + this.size.y / 2;
	        ctx.save();
	        ctx.globalAlpha = 0.5;
	        ctx.strokeStyle = 'red';
	        ctx.beginPath();
	        var radius = 12;
	        var x = cx + Math.cos(this.targetAngle) * radius;
	        var y = cy + Math.sin(this.targetAngle) * radius;
	        ctx.arc(x, y, 3, 0, Math.PI * 2, false);
	        ctx.stroke();
	        ctx.closePath();
	        ctx.restore();
	      }
	    }
	  }, {
	    key: 'move',
	    value: function move() {
	      var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	      var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	      this.acceleration.set(x, y);
	    }
	  }, {
	    key: 'moveLeft',
	    value: function moveLeft() {
	      this.move(-4, 0);
	    }
	  }, {
	    key: 'moveUp',
	    value: function moveUp() {
	      this.move(0, -4);
	    }
	  }, {
	    key: 'moveRight',
	    value: function moveRight() {
	      this.move(4, 0);
	    }
	  }, {
	    key: 'moveDown',
	    value: function moveDown() {
	      this.move(0, 4);
	    }
	  }, {
	    key: 'setTarget',
	    value: function setTarget(vec) {
	      this.target.copy(vec);
	      this.targetAngle = this.getTargetAngle();
	    }
	  }]);
	
	  return Entity;
	}(_Sprite3.default);
	
	exports.default = Entity;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Abstract2 = __webpack_require__(2);
	
	var _Abstract3 = _interopRequireDefault(_Abstract2);
	
	var _Vector = __webpack_require__(4);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	function getFrameCount(frames) {
	  var c = 0;
	  for (var i in frames) {
	    c++;
	  }
	  return c;
	}
	
	var Sprite = function (_Abstract) {
	  _inherits(Sprite, _Abstract);
	
	  function Sprite() {
	    var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	    var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	    var width = arguments.length <= 2 || arguments[2] === undefined ? 32 : arguments[2];
	    var height = arguments.length <= 3 || arguments[3] === undefined ? 32 : arguments[3];
	
	    _classCallCheck(this, Sprite);
	
	    var _this = _possibleConstructorReturn(this, (Sprite.__proto__ || Object.getPrototypeOf(Sprite)).call(this));
	
	    _this.children = [];
	    _this.position = new _Vector2.default(x, y);
	    _this.size = new _Vector2.default(width, height);
	    return _this;
	  }
	
	  _createClass(Sprite, [{
	    key: 'getJSONFrame',
	    value: function getJSONFrame(resource, frameNumber, resourceName) {
	      var totalFrames = getFrameCount(resource.data.frames);
	      var relativeFrame = frameNumber % totalFrames;
	      var name = resourceName + ' ' + relativeFrame + '.ase';
	      return resource.data.frames[name].frame;
	    }
	  }, {
	    key: 'drawDebug',
	    value: function drawDebug(ctx, frame) {
	      ctx.save();
	      ctx.globalAlpha = 0.5;
	      ctx.strokeStyle = 'magenta';
	      ctx.fillStyle = 'white';
	      ctx.beginPath();
	      ctx.rect(this.position.x + .5, this.position.y + .5, this.size.x, this.size.y);
	      ctx.fill();
	      ctx.stroke();
	      ctx.closePath();
	      var lineSize = 9;
	      var cx = this.position.x + this.size.x / 2 + .5;
	      var cy = this.position.y + this.size.y / 2 + .5;
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
	  }, {
	    key: 'drawFrame',
	    value: function drawFrame(ctx, frame) {}
	  }, {
	    key: 'draw',
	    value: function draw(ctx, frame) {}
	  }, {
	    key: 'drawChildren',
	    value: function drawChildren(ctx, frame, debug) {
	      this.children.forEach(function (sprite) {
	        return sprite.render(ctx, frame, debug);
	      });
	    }
	  }, {
	    key: 'render',
	    value: function render(ctx, frame, debug) {
	      if (debug && ctx) {
	        this.drawDebug(ctx, frame);
	      }
	
	      if (ctx) {
	        this.draw(ctx, frame);
	        this.drawChildren(ctx, frame, debug);
	      }
	    }
	  }]);
	
	  return Sprite;
	}(_Abstract3.default);
	
	exports.default = Sprite;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Entity2 = __webpack_require__(10);
	
	var _Entity3 = _interopRequireDefault(_Entity2);
	
	var _Vector = __webpack_require__(4);
	
	var _Vector2 = _interopRequireDefault(_Vector);
	
	var _generators = __webpack_require__(3);
	
	var _resources = __webpack_require__(8);
	
	var _Bullet = __webpack_require__(13);
	
	var _Bullet2 = _interopRequireDefault(_Bullet);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var MAX_HEALTH = 1;
	var SOLDIER_WIDTH = 32;
	var SOLDIER_HEIGHT = 32;
	
	var Soldier = function (_Entity) {
	  _inherits(Soldier, _Entity);
	
	  function Soldier(x, y) {
	    var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
	
	    var _ref$name = _ref.name;
	    var name = _ref$name === undefined ? (0, _generators.getRandomName)() : _ref$name;
	    var onKill = _ref.onKill;
	
	    _classCallCheck(this, Soldier);
	
	    var _this = _possibleConstructorReturn(this, (Soldier.__proto__ || Object.getPrototypeOf(Soldier)).call(this, x, y, SOLDIER_WIDTH, SOLDIER_HEIGHT));
	
	    _this.type = 'soldier';
	    _this.dontCollideWith = ['bullet'];
	    _this.targetingEnabled = true;
	    _this.health = MAX_HEALTH;
	    _this.name = name;
	    _this.points = 0;
	    _this.onKill = onKill;
	    _this.killed = false;
	    return _this;
	  }
	
	  _createClass(Soldier, [{
	    key: 'addDamage',
	    value: function addDamage() {
	      var damage = arguments.length <= 0 || arguments[0] === undefined ? 0.1 : arguments[0];
	      var killerId = arguments[1];
	
	      this.health -= damage;
	
	      if (this.health < 0) {
	        this.health = 0;
	      }
	      if (this.health <= 0) {
	        this.kill(killerId);
	      }
	    }
	  }, {
	    key: 'addPoints',
	    value: function addPoints() {
	      var points = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
	
	      this.points += points;
	    }
	  }, {
	    key: 'kill',
	    value: function kill(killerId) {
	      if (this.parent && !this.killed) {
	        this.killed = true;
	        this.onKill && this.onKill(killerId);
	        this.parent.remove(this);
	      }
	    }
	  }, {
	    key: 'drawFrame',
	    value: function drawFrame(ctx, frameNumber) {
	      ctx.save();
	      ctx.drawImage(_resources.resources.image.soldier.data, this.position.x, this.position.y);
	      ctx.restore();
	      this.drawFlameFrame(ctx, frameNumber);
	    }
	  }, {
	    key: 'drawFlameFrame',
	    value: function drawFlameFrame(ctx, frameNumber) {
	      var flame = _resources.resources.json.flame;
	
	      var flameX = 18;
	      var flameY = 21;
	      var flameFrame = this.getJSONFrame(flame, frameNumber, 'flame');
	
	      ctx.drawImage(_resources.resources.image.flame.data, flameFrame.x, flameFrame.y, flameFrame.w, flameFrame.h, this.position.x + flameX, this.position.y + flameY, flameFrame.w, flameFrame.h);
	    }
	  }, {
	    key: 'draw',
	    value: function draw(ctx, frame) {
	      _Entity3.default.prototype.draw.call(this, ctx, frame);
	      this.drawFrame(ctx, frame);
	      ctx.save();
	      ctx.fillStyle = 'rgba(0,0,0,0.5)';
	      ctx.beginPath();
	      ctx.rect(this.position.x, this.position.y - 10, this.size.x, 4);
	      ctx.fill();
	      ctx.closePath();
	      ctx.fillStyle = 'green';
	
	      ctx.beginPath();
	      ctx.rect(this.position.x, this.position.y - 10, this.size.x * this.health, 4);
	      ctx.fill();
	      ctx.closePath();
	
	      ctx.fillStyle = '#fff';
	      ctx.fillText(this.name, this.position.x, this.position.y - 18);
	      ctx.restore();
	    }
	  }, {
	    key: 'fire',
	    value: function fire(frame) {
	      if (frame % 5 == 0) {
	        var bullet = new _Bullet2.default(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.id, frame);
	        this.parent.add(bullet);
	        var v = _Vector2.default.subVecs(this.target, this.position);
	        bullet.velocity.copy(v.normalize().multiplyScalar(10));
	      }
	    }
	  }]);
	
	  return Soldier;
	}(_Entity3.default);
	
	exports.default = Soldier;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Entity2 = __webpack_require__(10);
	
	var _Entity3 = _interopRequireDefault(_Entity2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var BULLET_LIFETIME = 60;
	
	var Bullet = function (_Entity) {
	  _inherits(Bullet, _Entity);
	
	  function Bullet(x, y, ownerId, startFrame) {
	    _classCallCheck(this, Bullet);
	
	    var _this = _possibleConstructorReturn(this, (Bullet.__proto__ || Object.getPrototypeOf(Bullet)).call(this, x, y, 6, 6));
	
	    _this.noGrav = true;
	    _this.noFriction = true;
	    _this.ownerId = ownerId;
	    _this.startFrame = startFrame;
	    _this.type = 'bullet';
	    _this.damagePoints = 0.1;
	    _this.dontCollideWith = [_this.type, 'soldier'];
	    return _this;
	  }
	
	  _createClass(Bullet, [{
	    key: 'setFrame',
	    value: function setFrame(frame) {
	      this.frame = frame;
	    }
	  }, {
	    key: 'checkLifetime',
	    value: function checkLifetime(currentFrame) {
	      return currentFrame - this.startFrame > BULLET_LIFETIME;
	    }
	  }]);
	
	  return Bullet;
	}(_Entity3.default);
	
	exports.default = Bullet;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _Entity2 = __webpack_require__(10);
	
	var _Entity3 = _interopRequireDefault(_Entity2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var Ground = function (_Entity) {
	  _inherits(Ground, _Entity);
	
	  function Ground(x, y, width, height) {
	    _classCallCheck(this, Ground);
	
	    var _this = _possibleConstructorReturn(this, (Ground.__proto__ || Object.getPrototypeOf(Ground)).call(this, x, y, width, height));
	
	    _this.isFixed = true;
	    return _this;
	  }
	
	  return Ground;
	}(_Entity3.default);
	
	exports.default = Ground;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map