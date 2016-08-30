var msg = {
  type: 'hello'
}

function readCookie(name) {
  var c = document.cookie.split(';');
  for (let i = 0; i < c.length; ++i) {
    let item = c[i].trim();
    let cookie = item.split('=');
    cookie[0] = cookie[0].trim();
    cookie[1] = cookie[1].trim();
    if (cookie[0] == name) {
      return cookie[1]
    }
  }  
}
let ws = readCookie('ws');
let jetpack = readCookie('jetpack');
export var socket = new WebSocket('ws://' + (ws || 'localhost') , jetpack || 'abc');

socket.onopen = function () {
  socket.send(JSON.stringify(msg));
}

socket.onmessage = function (msgraw) {
  console.log(JSON.parse(msgraw.data));
}