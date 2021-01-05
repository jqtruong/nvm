window['programs/sine-wave'] = (() => {
  var _ms = 0;
  var _program = null;
  var _lim = 10000;
  var _interpolation = Math.interpolate({ input:  [0, _lim] });
  l(_interpolation);

  return {
    init: function() {
      return window['GL'].setupProgram().then(finishInit);
    },

    render: function(params) {
      let [mode, first, count, x = 0] = params;
      update(x);
      window['GL'].useProgram(_program);
      window['GL'].drawArrays(mode, first, count);
    },
  };

  function finishInit(glProgram) {
    _program = glProgram;
    return Promise.resolve(_program);
  }

  function update(x) {
    _ms += Game.msPassed;
    if (_ms >= _lim) _ms = 0;
    let y = _interpolation[Math.floor(_ms)];
    let freq = 20, amp = .1;
    let sx = x + Math.sin((y*freq) * Math.PI) * amp;
    let vertices = `${sx} ${y}`.toFloat32Array();
    let buffer = window['GL'].createBuffer(vertices);
    window['GL'].sendVertices(null, buffer, 'aPosition');
  }
})();
