const Matrix = (() => {

  const ID = `1 0 0 0
              0 1 0 0
              0 0 1 0
              0 0 0 1`.toFloat32Array();

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
  };

  function getOrtho() {
    const n = .1,
          f = 100,              
          xs =  2/Canvas.width,
          ys = -2/Canvas.height,
          zs =  2/(f - n);      // doesn't seem to matter for ortho

    return `${xs}     0     0     0
                0 ${ys}     0     0
                0     0 ${zs}     0
               -1     1     0     1`.toFloat32Array();
  }

  function vectorize(x, y, z) {
    x = parseFloat(x) || 0.0;
    y = parseFloat(y) || 0.0;
    z = parseFloat(z) || 0.0;

    return `${x}
            ${y}
            ${z}`.toFloat32Array();
  }

  // is this a matrix object or matrix array?
  function _multiplyByMatrix(mat) {
    var result = new Float32Array(16);

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
          .reduce((sum, cur) => sum + cur)
      });
  }

  function parseXYZ(x, y, z, d = 0.0 /* default */) {
    return {
      x: parseFloat(x) || d,
      y: parseFloat(y) || d,
      z: parseFloat(z) || d
    };
  }

  /* Transformations:
  https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
  */
  function _rotate(x0, y0, z0) {
    let { x, y, z } = parseXYZ(x0, y0, z0, 0),
        _mat = this;
        
    function Y(angle) {
      let a = Math.PI*angle/180,
          c = Math.cos(a),
          s = Math.sin(a),
          mat = ` ${c}   0   ${s}   0
                     0   1      0   0
                 ${-s}   0   ${c}   0    
                     0   0      0   1`.toFloat32Array();

      _mat.multiply(mat);
    }

    function Z(angle) {
      let a    = Math.PI*angle/180,
          cos  = Math.cos(a),
          _sin = Math.sin(a)*-1,
          sin  = Math.sin(a),
          mat  = `${cos} ${_sin}    0    0
                  ${sin}  ${cos}    0    0
                       0       0    1    0
                       0       0    0    1`.toFloat32Array();

      _mat.multiply(mat);
    }

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

  return {
    new: function() {
      return {
        matrix: ID.slice(),
        multiply: _multiplyByMatrix,
        rotate: _rotate,
        scale: _scale,
        translate: _translate
      };
    },
    projection: [],
    load: function() {
      this.projection = getPerspective();
    }
  };
})();
