const Matrix = (() => {

  const id = `1 0 0 0
              0 1 0 0
              0 0 1 0
              0 0 0 1`.toFloat32Array();

  function getPerspective() {
    // @TODO get some "perspective" on these
    const fov = 45 * Math.PI / 180,
          f = 1.0/Math.tan(fov/2),
          aspect = Canvas.width / Canvas.height,
          zNear = 0.1,
          zFar = 100.0,
          zSum = zNear + zFar,
          nf = 1.0/(zNear - zFar),
          zAll = zNear*zFar*nf;

    return `${f/aspect}    0          0  0
                      0 ${f}          0  0
                      0    0 ${zSum*nf} -1
                      0    0  ${2*zAll}  0`.toFloat32Array();
  };

  function loadPromise() {
    return new Promise((resolve, reject) => {
      this.projection = getPerspective();
      resolve(this.projection);
    });
  }

  return {
    identity: id.slice(),
    projection: [],
    translate: () => {},
    load: () => loadPromise.call(Matrix)
  };
})();
