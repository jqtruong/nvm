var Head = document.getElementsByTagName('head')[0];
var Body = document.body;
var DEBUG = false;
var l = (...msgs) => { if (DEBUG) console.log(...msgs); }
var e = console.error;
var N = 0;
var V = '';

const PROGRAMS = ['programs/drawing-modes',
                 'programs/drawing-modes-2'];
const SCRIPTS = ['Canvas',
                 'GL',
                 'Matrix',
                 'Programs',
                 'Frame', 
                 'Events',
                 'Game'];

window.onload = (e) => {
  N = new URLSearchParams(location.search).get('v') || 1;
  V = `v${N}`;
  DEBUG = !!(new URLSearchParams(location.search).get('d'));
  l('debug', DEBUG);

  // Load JS and CSS
  Helper.loadPrograms(PROGRAMS)
    .then(() => Helper.loadScripts(SCRIPTS))
    .then(() => Helper.loadCss('index'))
    .then(() => window['Game'].start())
    .catch(err => l('Game could not start due to', JSON.parse(err)));
};

var Helper = (function() {

  let DOM = document;

  return {
    getById: function(id) { return DOM.getElementById(id) },
    get1ByTag: function(name) { return DOM.getElementsByTagName(name)[0] },
    getAllByTag: function(name) { return DOM.getElementsByTagName(name) },
    loadCss: function(name) {
      return new Promise((ok, argh) => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `${V}/${name}.css`;
        link.onload = () => ok(true);

        Head.appendChild(link);
      })
    },
    loadProgram: function(name) {
      let filename = `${V}/${name}.js`;
      l('loading program', filename);
      return new Promise((ok, argh) => {
        let script = document.createElement('script');
        script.src = filename;
        script.onload = () => ok(JSON.stringify({ name, [name]: window[name] }));
        script.onerror = () => argh(JSON.stringify({ name, error: `failed to load ${filename}`, [name]: window[name] }));
        Body.appendChild(script);
      });
    },
    loadScript: function(name) {
      let filename = `${V}/${name.toLowerCase()}.js`;
      l('loading script', filename);
      return new Promise((ok, argh) => {
        let script = document.createElement('script');
        script.src = filename;
        script.onload = () => {
          return window[name].load()
            .then(() => ok(JSON.stringify({ name, [name]: window[name] })))
            .catch(error => argh(JSON.stringify({ name, error, [name]: window[name] })));
        },
        Body.appendChild(script);
      });
    },
    loadPrograms: function(names) {
      return names.reduce((acc, name) => acc.then(result => {
        if (result) l(JSON.parse(result));
        return this.loadProgram(name);
      }), Promise.resolve());
    },
    loadScripts: function(names) {
      return names.reduce((acc, name) => acc.then(result => {
        if (result) l(JSON.parse(result));
        return this.loadScript(name);
      }), Promise.resolve());
    },
  };
})();

var COORDS = {
  'x0':  0, 'y0':  1, 'z0':  2, 'w0':  3,
  'x1':  4, 'y1':  5, 'z1':  6, 'w1':  7,
  'x2':  8, 'y2':  9, 'z2': 10, 'w2': 11,
  'x3': 12, 'y3': 13, 'z3': 14, 'w3': 15,
};

var X = 'x';
var Y = 'y';
var Z = 'z';
var W = 'w';

//////////////////////////////////////////////////////////////////////
// Float32Array //
//////////////////

Float32Array.prototype.row = function (r) {
  return [
    this[COORDS[`x${r}`]],
    this[COORDS[`y${r}`]],
    this[COORDS[`z${r}`]],
    this[COORDS[`w${r}`]],
  ];
};

Float32Array.prototype.col = function (c) {
  return [
    this[COORDS[`${c}0`]],
    this[COORDS[`${c}1`]],
    this[COORDS[`${c}2`]],
    this[COORDS[`${c}3`]],
  ];
};

//////////////////////////////////////////////////////////////////////
// Math //
//////////

Math.interpolate = function (options) {
  let defaults = {
    input  : [ 0, 0],
    output : [-1, 1],
    steps  : null,
  };

  let { input,
        output,
        steps } = Object.assign(defaults, options);

  let deltas = { input:  delta(input),
                 output: delta(output) };

  let ratio = deltas.output/deltas.input;

  if (!steps) steps = deltas.input;
  if (!steps) return [];        // if input range is 0
  let step = deltas.input/steps;

  let values = [];
  for (i=0; i<=deltas.input; i+=step) {
    values.push(output[0] + (i*ratio));
  }

  return values;

  ////////////////////////////////////////////////////////////////////

  function delta([low, high]) {
    return Math.abs(low - high);
  }
};

//////////////////////////////////////////////////////////////////////
// String //
////////////
String.prototype.toFloat32Array = function() {
  const a = this.trim().replace(/[\n ]+/g, ' ').split(' ');
  return new Float32Array(a);
};

