const ID = `
1 0 0 0
0 1 0 0
0 0 1 0
0 0 0 1`.toFloat32Array();

var Matrix = (() => {

  return {
    new: _new,
    projection: [],
    load: function() {
      return new Promise((resolve, reject) => {
        this.projection = _new().rotate(10).multiply(getOrtho()).matrix;
        resolve();
      });
    }
  }

  function getPerspective() {
    // @TODO get some "perspective" on these
    const fov    = 45 * Math.PI / 180,
          f      = 1.0/Math.tan(fov/2),
          aspect = Canvas.width / Canvas.height,
          zNear  = 0.1,
          zFar   = 100.0,
          zSum   = zNear + zFar,
          nf     = 1.0/(zNear - zFar),
          zAll   = zNear*zFar*nf;

    l(Canvas.width, Canvas.height, fov, f/aspect, f, nf, zSum*nf, 2*zAll);
    
    return `${f/aspect}    0          0  0
                      0 ${f}          0  0
                      0    0 ${zSum*nf} -1
                      0    0  ${2*zAll}  0`.toFloat32Array();
  }

  function getOrtho() {
    const n = .1,
          f = 400,
          xs =  2/window['Canvas'].width,
          ys = -2/window['Canvas'].height,
          zs =  2/(f - n);      // doesn't seem to matter for ortho

    return `${xs}     0     0     0
                0 ${ys}     0     0
                0     0 ${zs}     0
               -1     1     0     1`.toFloat32Array();
  }

  function vectorize(x, y, z) {
    x = parseFloat(x) || 0;
    y = parseFloat(y) || 0;
    z = parseFloat(z) || 0;

    return `${x}
            ${y}
            ${z}`.toFloat32Array();
  }

  function _new() {
    var mat = {
      matrix: ID.slice(),
      multiply: _multiplyByMatrix,
      rotate: _rotate,
      scale: _scale,
      translate: _translate
    };

    return mat;
  }

  function itsAhMe() {
    console.log('mario', this);
  }

  // is this a matrix object or matrix array?
  function _multiplyByMatrix(mat) {
    var result = new Float32Array(16); // needed \; so \[ doesn't
                                       // activate

    [ result[COORDS.x0],
      result[COORDS.x1],
      result[COORDS.x2],
      result[COORDS.x3] ] = _multiplyByVector(this.matrix, mat.col(X));

    [ result[COORDS.y0],
      result[COORDS.y1],
      result[COORDS.y2],
      result[COORDS.y3] ] = _multiplyByVector(this.matrix, mat.col(Y));

    [ result[COORDS.z0],
      result[COORDS.z1],
      result[COORDS.z2],
      result[COORDS.z3] ] = _multiplyByVector(this.matrix, mat.col(Z));

    [ result[COORDS.w0],
      result[COORDS.w1],
      result[COORDS.w2],
      result[COORDS.w3] ] = _multiplyByVector(this.matrix, mat.col(W));

    this.matrix = result;
    return this;
  }

  // Return a 4x1 column from multiplying matrix w/ vector.
  function _multiplyByVector(matrix, vector) {
    return Array(4).fill()
      .map((_, i) => {
        return matrix.row(i)
          .map((val, j) => val*vector[j])
          .reduce((sum, cur) => sum + cur);
      });
  }

  function parseXYZ(x, y, z, d = 0 /* default */) {
    return {
      x: parseFloat(x) || d,
      y: parseFloat(y) || d,
      z: parseFloat(z) || d
    };
  }

  /* Transformations:
   * https://webglfundamentals.org/webgl/lessons/webgl-3d-orthographic.html  
   */
  function _rotate(x0, y0, z0) {
    let { x, y, z } = parseXYZ(x0, y0, z0, 0),
        _mat = this;

    function X(angle) {
      let a = Math.PI*angle/180,
          c = Math.cos(a),
          s = Math.sin(a),
          mat = `1     0    0  0
                 0  ${c} ${s}  0
                 0 ${-s} ${c}  0   
                 0     0    0  1`.toFloat32Array();

      _mat.multiply(mat);
    }

    function Y(angle) {
      let a = Math.PI*angle/180,
          c = Math.cos(a),
          s = Math.sin(a),
          mat = ` ${c}  0 ${s}  0
                     0  1    0  0
                 ${-s}  0 ${c}  0    
                     0  0    0  1`.toFloat32Array();

      _mat.multiply(mat);
    }

    function Z(angle) {
      let a = Math.PI*angle/180,
          c = Math.cos(a),
          s = Math.sin(a),
          mat  = `${c} ${-s}  0  0
                  ${s}  ${c}  0  0
                     0     0  1  0
                     0     0  0  1`.toFloat32Array();

      _mat.multiply(mat);
    }

    if (x) X(x);
    if (y) Y(y);
    if (z) Z(z);

    return this;
  }

  function _scale(x0, y0, z0) {
    let { x, y, z } = parseXYZ(x0, y0, z0, 1.0);

    this.matrix[COORDS.x0] *= x;
    this.matrix[COORDS.y1] *= y;
    this.matrix[COORDS.z2] *= z;

    return this;
  }

  function _translate(x0, y0, z0) {
    let { x, y, z } = parseXYZ(x0, y0, z0);

    this.matrix[COORDS.x3] = x;
    this.matrix[COORDS.y3] = y;
    this.matrix[COORDS.z3] = z;

    return this;
  }
})();

const Model = () => ({
  // let id = ID.slice(),
  //     rx = 0,
  //     ry = 0,
  //     rz = 0,
      
  //     sx = 0,
  //     sy = 0,
  //     sz = 0,
      
  //     tx = 0,
  //     ty = 0,
  //     tz = 0;

  // return {  };    

  rx: 10,
  tx: 0,
  sx: 0,

  ry: 20,
  ty: 0,
  sy: 0,
  
  rz: 30,
  tz: 0,
  sz: 0,

  toString: function() {
    return `(${this.rx}, ${this.ry}, ${this.rz})`;
  },
});
