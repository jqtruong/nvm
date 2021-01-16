window[`programs/lines`] = (() => {
  var _program = null;

  return {
    init: function() {
      return window['GL'].setupProgram().then(finishInit);
    },

    render: function(params) {
      window['GL'].useProgram(_program);
      let [x = 0] = params;
      l(x);
      let vertices = `${x - .2} -1
                      ${x - .2}  1
                      ${x + .2} -1
                      ${x + .2}  1`.toFloat32Array();
      let buffer = window['GL'].createBuffer(vertices);
      window['GL'].sendVertices(null, buffer, 'aPosition');
      window['GL'].drawArrays('LINES', 0, 2);
    },
  };

  function finishInit(glProgram) {
    _program = glProgram;
    return Promise.resolve(_program);
  }
})();
