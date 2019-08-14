var Programs = (() => {

  var _runners = [];
  var _progs = {};
  var _currentProgram = null;

  return {
    load,
    renderAll,
  };

  ////////////////////////////////////////////////////////////////////////////////

  function Drawing(mode, first, count, x = 0) {
    var _ms = 0;
    var _y = 0;
    var _program = null;
    var _lim = 10000;
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
      _y = _interpolation[Math.floor(_ms)];

      var vertices = `     ${x} ${_y + .1}
                      ${x - .1}      ${_y}
                      ${x + .1}      ${_y}`.toFloat32Array();
      var buffer = window['GL'].createBuffer(vertices);
      window['GL'].sendVertices(null, buffer, 'aPosition');
    }
  }

  function load() {
    return new Promise((resolve, reject) => {
      _runners.push(Drawing('POINTS', 0, 1, -.45));
      _runners.push(Drawing('POINTS', 0, 1,  .45));
      _runners.push(Drawing('TRIANGLES', 0, 3, -.25));
      _runners.push(Drawing('TRIANGLES', 0, 3,  .25));
      Promise.all(_runners.map(r => r.init()))
        .then(resolve)
        .catch(reject);
    });
  }

  function renderAll() {
    _runners.forEach(r => r.render());
  }

})();
