
function readCookie(name) {
  var c = document.cookie.split(';');
  for (let i = 0; i < c.length; ++i) {
    let item = c[i].trim();
    let cookie = item.split('=');
    cookie[0] = cookie[0].trim();
    cookie[1] = decodeURIComponent(cookie[1].trim());
    if (cookie[0] == name) {
      return cookie[1]
    }
  }  
}
let ws = readCookie('ws');
let jetpack = readCookie('jetpack');

let socket;

export function connect(cb, onMsg = () => {}) {
  socket = new WebSocket('ws://' + (ws || 'localhost') , jetpack || 'abc');

  socket.onopen = function () {
    cb();
  }

  socket.onmessage = function (msgraw) {
    onMsg(JSON.parse(msgraw.data));
  }
}

export function sendMsg(msg) {
  socket.send(JSON.stringify(msg));
}