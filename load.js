var Head = document.getElementsByTagName('head')[0];
var Body = document.body;
var DEBUG = false;
var l = (...msgs) => { if (DEBUG) console.log(...msgs); }
var e = console.error;
var N = 0;
var V = '';

const SCRIPTS = [
  'Canvas'   ,
  'GL'       ,
  'Matrix'   ,
  'Programs' ,
  'Frame'    ,
  'Events'   ,
  'Game'     ,
];

window.onload = (e) => {
  N = new URLSearchParams(location.search).get('v') || 1;
  V = `v${N}`;
  DEBUG = !!(new URLSearchParams(location.search).get('d'));
  l('debug', DEBUG);

  // Load JS and CSS
  Load.scripts(SCRIPTS, 'load')
    .then(() => Load.css('index'))
    .then(() => window['Game'].start())
    .catch(err => l('Game could not start due to', err));
};

var Load = (() => {

  return {
    css: function(name) {
      return new Promise((ok, argh) => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `${V}/${name}.css`;
        link.onload = () => ok(true);

        Head.appendChild(link);
      })
    },
    scripts: function (names, callback) {
      return names.reduce((acc, name, i) => acc.then(result => {
        if (result) l(`#${i}:`, JSON.parse(result));
        return _appendScript(name, callback);
      }), Promise.resolve());
    },
  };

  function _appendScript(name, callback) {
    let filename = `${V}/${name}.js`;
    l('loading script', filename);
    return new Promise((ok, argh) => {
      let script = document.createElement('script');
      script.src = filename;
      script.onload = _onScriptLoad(name, ok, argh, callback);
      script.onerror = _onScriptError(name, argh);
      Body.appendChild(script);
    });
  }

  function _createScript(filename) {
    return new Promise((ok, argh) => {
      let script = document.createElement('script');
      script.src = filename;
      script.onload = _onScriptLoad(name, ok, argh, cb);
      script.onerror = _onScriptError(name, argh);
    });
  }

  function _makeFileName(path) {
    const filename = `${V}/${name}.js`;
    return filename;
  }

  function _onScriptError(name, argh) {
    return () => argh(JSON.stringify({
      name,
      error: `failed to load ${name}`,
      [name]: window[name],
    }));
  }

  function _onScriptLoad(name, ok, argh, callback) {
    return () => {
      let obj = {
        name,
        [name]: window[name]
      };
      if (!callback) return ok(JSON.stringify(obj));
      window[name][callback]()
        .then(() => ok(JSON.stringify(obj)))
        .catch(error => argh(JSON.stringify({ ...obj, error })));
    };
  }

})();

var Helper = (function() {

  let DOM = document;

  return {
    getById: function(id) { return DOM.getElementById(id) },
    get1ByTag: function(name) { return DOM.getElementsByTagName(name)[0] },
    getAllByTag: function(name) { return DOM.getElementsByTagName(name) },
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
  const NONE_THE_STEPS = 0;

  let defaults = {
    input  : [ 0, 0] ,
    output : [-1, 1] ,
    steps  : null    ,
  };

  let { input  ,
        output ,
        steps  } = { ...defaults, ...options };

  let deltas = { input  : delta(input)  ,
                 output : delta(output) };

  let ratio = deltas.output/deltas.input;
  let precision = calcPrecision();

  if (!steps) steps = deltas.input;
  if (steps == NONE_THE_STEPS) return [];
  let step = deltas.input/steps;

  let values = [];
  let value = 0;
  for (let i=0; i<=deltas.input; i+=step) {
    value = output[0] + (i*ratio);
    values.push(value.toFixed(precision));
  }

  return values;

  ////////////////////////////////////////////////////////////////////

  function delta([low, high]) {
    return Math.abs(low - high);
  }

  /* Returns log base 10 of the input delta, which is essentially the number of 0s the delta has, eg. 1,000,000 => 6. */
  function calcPrecision() {
    /* Math.log(Math.E) == 1 */
    return Math.floor(Math.log(deltas.input) / Math.log(10));
  }
};

//////////////////////////////////////////////////////////////////////
// String //
////////////
String.prototype.toFloat32Array = function() {
  const a = this.trim().replace(/[\n ]+/g, ' ').split(' ');
  return new Float32Array(a);
};
