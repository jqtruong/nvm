const Head = document.getElementsByTagName('head')[0],
      Body = document.body,
      l = console.log,
      e = console.error;

let N = 0,
    V = '';

window.onload = (e) => {
  N = new URLSearchParams(location.search).get('v') || 1;
  V = `v${N}`;

  // Load JS and CSS
  Helper.loadScript('matrix')
    .then(() => Helper.loadScript('design'))
    .then(() => Helper.loadScript('main'))
    .then(() => new Promise((ok, argh) => {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = `${V}.css`;
      link.onload = () => ok(true);

      Head.appendChild(link);
    }))
    .then(Game.load)
    .then(Game.start)
    .catch(err => l(`Game could not start due to ${err}.`));
};

var Helper = (function() {

  var d = document;

  return {
    getById: (id) => d.getElementById(id),
    get1ByTag: (name) => d.getElementsByTagName(name)[0],
    getAllByTag: (name) => d.getElementsByTagName(name),
    loadScript: (name) => new Promise((ok, argh) => {
      var script = document.createElement('script');
      script.src = `${V}.${name}.js`;
      script.onload = () => ok(true);

      Body.appendChild(script);
    })
  };
})();

const Game = (() => {
  let _id = 0,                  // request frame id
      _loads = [],
      _looper = () => l('you should be spinning me right round, but youre not...'),

      _msPassed = 0,
      _lastMs   = 0,
      _points   = 0;

  return {
    points: () => _points,
    zeroth: () => Math.ceil(_lastMs*60/1000)%60 == 0,

    addLoad: (name, loader) => {
      _loads.push({
        name: name,
        promise: () => loader()
          .then(result => {
            l(`${name} loaded`);
            return result;
          })
          .catch(msg => {
            e(`Error: loading ${name}: ${msg}.`);
            return Promise.reject('failure to load');
          })
      });
    },
    load: () => Promise.all(_loads.map(l => l.promise())),
    newLoad: loads => Promise.all(Object.entries(loads).map(o => o[1].load())).catch(console.error),

    msPassed: 0,
    setLoop: (f) => _looper = f,
    loop: function(ms) {
      this.msPassed = ms - _lastMs;
      _lastMs = ms;
      _id = window.requestAnimationFrame(_looper);
    },

    start: () => Game.loop.call(Game, 0),
    stop: () => {
      window.cancelAnimationFrame(_id);
      return _id;
    }
  };
})();

var Events = (() => {
  
  window.onkeyup = (e) => {
    switch (e.keyCode) {

    case 27:                      // esc
      l(`stopped game at ${Game.stop()}`);
      break;

    default:
      l('Keycode:', e.keyCode);
    }
  };

})();

String.prototype.toFloat32Array = function() {
  const a = this.trim().replace(/[\n ]+/g, ' ').split(' ');
  return new Float32Array(a);
};

let COORDS = {
  'x0':  0, 'y0':  1, 'z0':  2, 'w0':  3,
  'x1':  4, 'y1':  5, 'z1':  6, 'w1':  7,
  'x2':  8, 'y2':  9, 'z2': 10, 'w2': 11,
  'x3': 12, 'y3': 13, 'z3': 14, 'w3': 15,
};

const X = 'x',
      Y = 'y',
      Z = 'z',
      W = 'w';

Float32Array.prototype.row = function(r) {
  return [ this[COORDS[`x${r}`]],
           this[COORDS[`y${r}`]],
           this[COORDS[`z${r}`]],
           this[COORDS[`w${r}`]]  ];
};

Float32Array.prototype.col = function(c) {
  return [ this[COORDS[`${c}0`]],
           this[COORDS[`${c}1`]],
           this[COORDS[`${c}2`]],
           this[COORDS[`${c}3`]]  ];
};
