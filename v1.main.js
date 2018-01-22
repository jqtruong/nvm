const Canvas = (() => {
  const _canvas = document.createElement('canvas'),
        _gl = _canvas.getContext('webgl');

  const _loadPromise = () => new Promise((resolve, reject) => {
    if (!_gl) {
      reject('Unable to initialize WebGL; check browser compatibility.');
    }

    _canvas.width  = window.innerWidth;
    _canvas.height = window.innerHeight;

    if (Body.appendChild(_canvas)) resolve();
    else reject('could not append canvas');
  });

  /////////////////////////////////////////

  return {
    gl: _gl,
    load: () => _loadPromise().then(Programs.load),
    render: () => {
      // Clear
      _gl.viewport(0, 0, _canvas.width, _canvas.height);
      _gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      _gl.clearDepth(1.0);                // Clear everything
      _gl.enable(_gl.DEPTH_TEST);         // Enable depth testing
      _gl.depthFunc(_gl.LEQUAL);          // Near things obscure
      _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
    }
  };
})();


// @NOTE: Dependent on the Canvas being loaded first!
const Programs = (() => {

  let _gl = null;

  const _loadPromise = (gl) => new Promise((resolve, reject) => {
    if (gl) {
      _gl = gl;
      resolve();
    } else {
      reject(Helper.rejectPromise('no gl context'));
    }
  }

  const _programs = {
    test: (() => {
      const positions = [
         0.5,  1,
        -0.5,  1,
         0.5, -1,
        -0.5, -1
      ];
      const colors = [
        1.0,  1.0,  1.0,  1.0,  // white
        1.0,  0.0,  0.0,  1.0,  // red
        0.0,  1.0,  0.0,  1.0,  // green
        0.0,  0.0,  1.0,  1.0,  // blue
      ];

      let _program,
          a_position,
          a_color,
          u_model_matrix,
          positionBuffer,
          colorBuffer;

      return {
        init: (program) => {
          _program = program;
          a_position = _gl.getAttribLocation(program, 'a_position');
          a_color = _gl.getAttribLocation(program, 'a_color');
          u_model_matrix = _gl.getAttribLocation(program, 'u_model_matrix');

          positionBuffer = _createBuffer(positions);
          colorBuffer = _createBuffer(colors);
        },

        run: () => {
          
        }
      };
    })()
  };

  function _setup(key, vrt = 'default', frg = 'default') {
    function checkShader(shader) {
      const error = ! _gl.getShaderParameter(shader, _gl.COMPILE_STATUS)
      if (error) {
        l('Program error with shader:', _gl.getShaderInfoLog(shader))
        _gl.deleteShader(shader)
        return Helper.rejectPromise('a bad shader')
      }

      return shader
    }

    function compileShader(type, url) {
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            let err = 
                l(`Error loading ${url} shader with response: `, response);
            return Helper.rejectPromise(url);
          }

          return response.text();
        })
        .then((source) => {
          const shader = _gl.createShader(type);
          _gl.shaderSource(shader, source);
          _gl.compileShader(shader);

          return checkShader(shader);
        });
    }

    const program = _gl.createProgram(),
          vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
          frgFile = `${V}.${frg}-frg.c`;

    return compileShader(_gl.VERTEX_SHADER, vrtFile)
      .then((vrtShader) => {
        _gl.attachShader(program, vrtShader);
        return compileShader(_gl.FRAGMENT_SHADER, frgFile);
      })
      .then((frgShader) => {
        _gl.attachShader(program, frgShader);
        _gl.linkProgram(program);

        if (! _gl.getProgramParameter(program, _gl.LINK_STATUS)) {
          var info = _gl.getProgramInfoLog(program);
          l('Could not link WebGL program' +
            (info ? `:\n\n${info}` : '.'));
          return Helper.rejectPromise('bad program') ;
        }

        return _programs[key].init(program);
      });
  }

  function _createBuffer(data) {
    let buffer = _gl.createBuffer();
    _gl.bindBuffer(_gl.ARRAY_BUFFER, buffer);
    _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    return buffer;
  }

  return {
    load: (gl) => _loadPromise(gl)
  };
})();


const Frame = (() => {

  const _update = () => {

  }

  const _render = () => {
    Canvas.render()
  }

  return {
    next: (ms) => {
      Game.loop(ms)
      _update()
      _render()
    }
  }
})()


const V1 = (() => {
  l('Game v1...')

  Game.addLoad('Canvas and Programs', Canvas.load)
  Game.setLoop(Frame.next)
})()

// 
// var Test = (() => {
//   function deLoop(ms) {
//     Game.loop(deLoop)
//   }

//   return {
//     go: () => Game.loop(deLoop)
//   }
// })()

// Test.go()
