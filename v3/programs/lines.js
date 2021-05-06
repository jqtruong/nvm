window[`programs/lines`] = (() => {
  var _alphaLoc = null;
  var _dir = 1;
  var _lim = 10000;
  var _ms = 0;
  var _positionLoc = null
  var _program = null;

  return {
    init: function() {
      return window['GL'].setupProgram('default', 'fading').then(finishInit);
    },

    render: function(params) {
      window['GL'].useProgram(_program);
      let [x = 0] = params;
      let vertices = `${x - .2} -1
                      ${x - .2}  1
                      ${x + .2} -1
                      ${x + .2}  1
                      ${x - .2} -1
                      ${x + .2}  1`.toFloat32Array();
      let buffer = window['GL'].createBuffer(vertices);
      window['GL'].sendVertices(null, buffer, _positionLoc);

      _ms += window['Game'].msPassed * _dir;
      if (_dir == 1 && _ms >= _lim) _dir = -1;
      else if (_dir == -1 && _ms <= 0) _dir = 1;
      window['GL'].setUniform('1f', _alphaLoc, _ms / _lim);
      window['GL'].drawArrays('LINES', 0, 6);
    },
  };

  function finishInit(glProgram) {
    _program = glProgram;
    _alphaLoc = window['GL'].getUniform(glProgram, 'u_alpha');
    _positionLoc = window['GL'].getAttrib(glProgram, 'aPosition');
    return Promise.resolve(_program);
  }
})();
