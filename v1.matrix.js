const Matrix = (() => {

  const COORDS = {
    'x0':  0, 'y0':  1, 'z0':  2, 'w0':  3,
    'x1':  4, 'y1':  5, 'z1':  6, 'w1':  7,
    'x2':  8, 'y2':  9, 'z2': 10, 'w2': 11,
    'x3': 12, 'y3': 13, 'z3': 14, 'w3': 15,
  };

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

  function _multiply(matrix, vector) {
    let { x, y, z, w } = vector;
    return {
      x: x*matrix[COORDS.x0] + y*matrix[COORDS.y0] + z*matrix[COORDS.z0] + w*matrix[COORDS.w0],
      y: x*matrix[COORDS.x1] + y*matrix[COORDS.y1] + z*matrix[COORDS.z1] + w*matrix[COORDS.w1],
      z: x*matrix[COORDS.x2] + y*matrix[COORDS.y2] + z*matrix[COORDS.z2] + w*matrix[COORDS.w2],
      w: x*matrix[COORDS.x3] + y*matrix[COORDS.y3] + z*matrix[COORDS.z3] + w*matrix[COORDS.w3]
    }
  }

  function parseXYZ(x, y, z, d = 0.0 /* default */) {
    return {
      x: parseFloat(x) || d,
      y: parseFloat(y) || d,
      z: parseFloat(z) || d
    };
  }

  // Transformations: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web
  function _rotate(x0, y0, z0) {
    let { x, y, z } = parseXYZ(x0, y0, z0, null);

    function X(a) {
      this.matrix[COORDS.y1] *= Math.cos(a);
      this.matrix[COORDS.z1] *= Math.sin(a)*-1;
      this.matrix[COORDS.y2] *= Math.sin(a);
      this.matrix[COORDS.z2] *= Math.cos(a);
    }

    function Y(a) {
      this.matrix[COORDS.x0] *= Math.cos(a);
      this.matrix[COORDS.z0] *= Math.sin(a);
      this.matrix[COORDS.x2] *= Math.sin(a)*-1;
      this.matrix[COORDS.z2] *= Math.cos(a);
    }

    function Z(a) {
      this.matrix[COORDS.x0] *= Math.cos(a);
      this.matrix[COORDS.y0] *= Math.sin(a)*-1;
      this.matrix[COORDS.x1] *= Math.sin(a);
      this.matrix[COORDS.y1] *= Math.cos(a);
    }

    if (x) X.call(this, Math.PI*x/180);
    if (y) Y.call(this, Math.PI*y/180);
    if (z) Z.call(this, Math.PI*z/180);
    l(this.matrix);
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
        rotate: _rotate,
        scale: _scale,
        translate: _translate
      };
    },
    projection: [],
    load: function() {
      this.projection = getOrtho();
    }
  };
})();
