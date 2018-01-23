String.prototype.toMatrix = function() {
  return this.split(' ').map(s => parseFloat(s)).filter(i => !isNaN(i));
};

const Matrix = (() => {

  const id = `1 0 0 0
              0 1 0 0
              0 0 1 0
              0 0 0 1`.toMatrix();

  const perspective = {
    fov: 45 * Math.PI / 180,
    aspect: Canvas.width / Canvas.height,
    zNear: 0.1,
    zFar: 100.0
  };

  return {
    identity: () => id.slice(),
    projection: 0,
  };
})();
