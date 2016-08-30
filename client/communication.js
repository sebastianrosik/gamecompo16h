var msg = {
  type: 'hello'
}

export var socket = new WebSocket('ws://localhost', 'test');

socket.onopen = function () {
  socket.send(JSON.strigify(msg));
}

socket.onmessage = function (msgraw) {
  console.log(JSON.parse(msgraw));
}