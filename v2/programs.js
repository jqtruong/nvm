var Programs = (() => {

  var _runners = [];
  var _progs = {};
  var _currentProgram = null;

  return {
    load: function() {
      return new Promise((resolve, reject) => {
        _runners.push(DrawArrays('POINTS', 0, 1, -.25));
        // _runners.push(DrawArrays('POINTS', 0, 1,  .25));
        Promise.all(_runners.map(r => r.init()))
          .then(resolve)
          .catch(reject);
      });
    },
    renderAll: function() {
      _runners.forEach(r => r.render());
    },
  };

  ////////////////////////////////////////////////////////////////////////////////

  function DrawArrays(mode, first, count, x) {
    var _ms = 0;
    var _y = 0;
    var _program = null;
    var _lim = 1000;
    var _interpolation = Math.interpolate({ input:  [0, _lim] });

    return {
      init: function() {
        return window['GL'].setupProgram().then(finishInit);
      },
      render: function() {
        update();
        window['GL'].useProgram(_program);
        window['GL'].drawArrays(mode, first, count);
      }
    };

    function finishInit(glProgram) {
      _program = glProgram;
      return Promise.resolve(_program);
    }

    function update() {
      _ms += Game.msPassed;
      if (_ms >= _lim) _ms = 0;
      _y = _interpolation[Math.round(_ms)];

      var vertices = new Float32Array([x, _y]);
      var buffer = window['GL'].createBuffer(vertices);
      window['GL'].sendVertices(null, buffer, 'aPosition');
    }
  }
})();
