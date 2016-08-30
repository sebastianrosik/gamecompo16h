export var resources = {
  image: {},
  json: {},
  load: function (callback) {
    files.forEach(file => {
      loadJSON('./' + file + '.json', json => {
        resources.json[file] = {data: json, name: file};
        loaded++;
        check(callback);
      })
      loadImage('./' + file + '.png', image => {
        resources.image[file] = {data: image, name: file};
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
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      callback(JSON.parse(xhr.response));
    }
  }
}

function loadImage(file, callback) {
  var image = new Image();
  image.onload = function () {
    callback(image)
  }
  image.src = file;
}

let files = ['flame', 'soldier'];
let loaded = 0;
var total = files.length * 2;

function check(cb) {
  if (total <= loaded) {
    cb();
  }
}


window.resources = resources;
