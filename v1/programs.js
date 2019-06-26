var Programs = (() => {

  var _progs = {};

  return {
    load: function() {
      return new Promise((resolve, reject) => {
        _progs['Test'] = Test();
        this.current = _progs['Test'];
        this.current.init()
          .then(foo => { l('hey', foo); resolve(); })
          .catch(bar => { e('boo', bar); reject(); });
      });
    },

    current: null,

    prep: function() { this.current.prep(); }
  };

  function Test() {
    var w = 50, h = 100, r = w/2, l = -r, t = 0, b = h;

    var positions = `${l} ${t}
                     ${r} ${t}
                     ${l} ${b}
                     ${l} ${b}
                     ${r} ${t}
                     ${r} ${b}`.toFloat32Array();

    var colors = `1  1  1  1
                  1  0  0  1
                  0  1  0  1
                  0  0  1  1`.toFloat32Array();

    var program;
    var a_position;
    var a_color;
    var u_model_matrix;
    var model;
    var u_projection_matrix;
    var positionBuffer;
    var colorBuffer;
    var ms = 0;
    var angle = 1;

    return {
      init: function() {
        model = window['Matrix'].new()
        return window['GL'].setupProgram().then(finishInit);
      },
      prep: function() {
        update();
        window['GL'].sendVertices({}, positionBuffer, a_position);
        window['GL'].useProgram(program);
        window['GL'].setUniform('4fv', u_model_matrix, model.matrix);
        window['GL'].setUniform('4fv', u_projection_matrix, window['Matrix'].projection);
        window['GL'].drawArrays('TRIANGLES', 0, 6);
      }
    };

    function finishInit(glProgram) {
      program = glProgram;

      a_position = window['GL'].getAttrib(program, 'a_position');
      a_color = window['GL'].getAttrib(program, 'a_color');

      u_model_matrix = window['GL'].getUniform(program, 'u_model_matrix');
      u_projection_matrix = window['GL'].getUniform(program, 'u_projection_matrix');

      positionBuffer = window['GL'].createBuffer(positions);
      colorBuffer = window['GL'].createBuffer(colors);
    }

    function update() {
      ms += Game.msPassed;
      if (ms > 16) {
        model
          .rotate(0, angle)
          .translate((window['Canvas'].width - w)/2,
                     window['Canvas'].height/2);
        ms = 0;
      }
    }
  }
})();
