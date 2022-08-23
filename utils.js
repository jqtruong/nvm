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

