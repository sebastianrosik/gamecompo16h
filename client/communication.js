var msg = {
  type: 'hello'
}

function readCookie(name) {
  var c = document.cookie.split(';');
  for (let i = 0; i < c.length; ++i) {
    let item = c[i];    
    let cookie = item.split('=');
    if (cookie[0] == name) {
      return cookie[1]
    }
  }  
}

export var socket = new WebSocket('ws://' + (readCookie('ws') || 'localhost') , readCookie('jetpack') || 'abc');

socket.onopen = function () {
  socket.send(JSON.stringify(msg));
}

socket.onmessage = function (msgraw) {
  console.log(JSON.parse(msgraw.data));
}