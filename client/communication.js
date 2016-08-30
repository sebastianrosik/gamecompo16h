
export function readCookie(name) {
  var c = document.cookie.split(';');
  for (let i = 0; i < c.length; ++i) {
    let item = c[i].trim();
    let cookie = item.split('=');
    let cname = cookie[0];
    let cvalue = cookie[1];
    if (cname && cvalue) {
      cname = decodeURIComponent(cname).trim();
      cvalue = decodeURIComponent(cvalue).trim();
      if (name == cname) {
        return cvalue;
      }
    }
  }  
}

let ws = readCookie('ws');
let jetpack = readCookie('jetpack');

let socket;
let reconnecting = false;


function reconnect(cb, onMsg, onDsc) {
  reconnecting = true;
  setTimeout(() => {
    if (reconnecting) {      
      connect(cb, onMsg, onDsc)
    }
  }, 5000);
}

export function connect(cb, onMsg = () => {}, onDsc = () => {}) {
  console.log('connecting....')
  socket = new WebSocket('ws://' + (ws || 'localhost') , jetpack || 'abc');

  socket.onopen = function () {
    cb();
    reconnecting = false;
  }

  socket.onclose = function () {
    console.log('CLOSE');
    socket.close()
    reconnect(cb, onMsg, onDsc);
  }
  socket.onmessage = function (msgraw) {
    onMsg(JSON.parse(msgraw.data));
  }
}

export function isConnected() {
  return socket && socket.readyState === 1;
}
export function sendMsg(msg) {
  socket && socket.send(JSON.stringify(msg));
}