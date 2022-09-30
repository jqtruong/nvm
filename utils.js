var Helper = (function() {

    let DOM = document;

    return {
        getById: function(id) { return DOM.getElementById(id) },
        get1ByTag: function(name) { return DOM.getElementsByTagName(name)[0] },
        getAllByTag: function(name) { return DOM.getElementsByTagName(name) },
    };

})();


///////////
// Array //
///////////

Array.prototype.toRgba = function() {
    console.log('this is', this);
    return {
        r: this[0],
        g: this[1],
        b: this[2],
        a: this[3] ?? 1.0,
    };
}


//////////////////
// Float32Array //
//////////////////

// TODO (when updating matrix) decide on whether prototyping vs adding to
// Matrix, but the latter needs an update

Float32Array.prototype.coords = {
    'x0':  0, 'y0':  1, 'z0':  2, 'w0':  3,
    'x1':  4, 'y1':  5, 'z1':  6, 'w1':  7,
    'x2':  8, 'y2':  9, 'z2': 10, 'w2': 11,
    'x3': 12, 'y3': 13, 'z3': 14, 'w3': 15,
};

Float32Array.prototype.X = 'x';
Float32Array.prototype.Y = 'y';
Float32Array.prototype.Z = 'z';
Float32Array.prototype.W = 'w';

Float32Array.prototype.row = function (r) {
    return [
        this[this.coords[`x${r}`]],
        this[this.coords[`y${r}`]],
        this[this.coords[`z${r}`]],
        this[this.coords[`w${r}`]],
    ];
};

Float32Array.prototype.col = function (c) {
    return [
        this[this.coords[`${c}0`]],
        this[this.coords[`${c}1`]],
        this[this.coords[`${c}2`]],
        this[this.coords[`${c}3`]],
    ];
};


//////////
// Math //
//////////

/**
 * Returns log base 10 of the input delta, which is essentially the number of
 * 0s the delta has, eg. 1,000,000 => 6.
 *
 * FYI, Math.log(Math.E) == 1
 **/
Math.estimatePrecision = (num) => Math.floor(Math.log(num) / Math.log(10));

Math.interpolate = {
    range: (options) => {
        let defaults = {
            input: [0, Math.PI],
            output: [-1 , 1],
            precision: null,
            step: Math.PI/180,
            translateRatio: null,
        };

        let {
            input,
            output,
            precision,
            step,
            translateRatio,
        } = { ...defaults, ...options };

        let [inFrom, inTo, outFrom, outTo] = input.concat(output);
        let steps = (inTo - inFrom) / step;

        if (!precision) precision = Math.estimatePrecision(steps);

        if (!translateRatio) {
            translateRatio = (outTo - outFrom) / steps;
        }

        let interpolatedValues = [];
        while (inFrom < inTo) {
            let iv = outFrom + inFrom / step / translateRatio;
            interpolatedValues.push(iv.toFixed(precision));
            inFrom += step;
        }

        return interpolatedValues;
    },

    // Given a range of inputs, an input value, a range of outputs, find the
    // output value.
    //
    value: ({ offset, i, ratio }) => offset + i * ratio,
};


////////////
// String //
////////////

String.prototype.toFloat32Array = function() {
    const a = this.trim().replace(/[\n ]+/g, ' ').split(' ');
    return new Float32Array(a);
};
