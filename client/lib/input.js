const KEYS = {
  8:  'backspace',
  9:  'tab',
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
}

function getKeyName(keyCode) {
  return KEYS[keyCode] || null;
}

let oldX = 0, oldY = 0;
let offsetX = 0, offsetY = 0;

window.addEventListener('mousemove', e => {
  oldX = mouse.x;
  oldY = mouse.y;
  mouse.x = e.pageX - offsetX; 
  mouse.y = e.pageY - offsetY; 
  mouse.dx = oldX - mouse.x;
  mouse.dy = oldY - mouse.y;
});

export let mouse = {
  button: [false, false, false],
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  setOffset(offset) {
    offsetX = offset.x;
    offsetY = offset.y;
  }
};

export let keyboard = {};

for (let n in KEYS) {
  keyboard[KEYS[n]] = false;
}

window.addEventListener('keydown', e => {
  let keyCode = e.which || e.keyCode;
  keyboard[getKeyName(keyCode)] = true;
});

window.addEventListener('keyup', e => {
  let keyCode = e.which || e.keyCode;
  keyboard[getKeyName(keyCode)] = false;
});

window.addEventListener('mousedown', e => {
  mouse.button[e.button] = true;
});

window.addEventListener('mouseup', e => {
  mouse.button[e.button] = false;
});
