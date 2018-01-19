const Canvas = (() => {
  const _canvas = document.createElement('canvas'),
        _gl = _canvas.getContext('webgl');

  /////////////////////////////////////////

  return {
    gl: _gl,
    load: () => new Promise((resolve, reject) => {
      if (!_gl) {
        reject('Unable to initialize WebGL; check browser compatibility.');
      }

      _canvas.width  = window.innerWidth;
      _canvas.height = window.innerHeight;

      if (Body.appendChild(_canvas)) resolve();
      else reject('could not append canvas');
    })
      .then(Programs.load),
    render: () => {
      // Clear
      _gl.viewport(0, 0, _canvas.width, _canvas.height)
      _gl.clearColor(0, 0, 0, 1.0)
      _gl.clear(_gl.COLOR_BUFFER_BIT)
    }
  };
})();


// @NOTE: Dependent on the Canvas being loaded first!
const Programs = (() => {

  const _programs = {
    test: (() => {
      const positions = [
        0.5,  1,
        -0.5,  1,
        0.5, -1,
        -0.5, -1
      ];

      let _program,
          a_position,
          u_model_matrix,
          positionBuffer;

      return {
        init: (program) => {
          _program = program;
          a_position = Canvas.gl.getAttribLocation(program, 'a_position');
          u_model_matrix = Canvas.gl.getAttribLocation(program, 'u_model_matrix');

          positionBuffer = _createBuffer();
        },

        run: () => {
          
        }
      };
    })()
  };

  function _setup(key, vrt = 'default', frg = 'default') {
    function checkShader(shader) {
      const error = ! Canvas.gl.getShaderParameter(shader, Canvas.gl.COMPILE_STATUS)
      if (error) {
        l('Program error with shader:', Canvas.gl.getShaderInfoLog(shader))
        Canvas.gl.deleteShader(shader)
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
          const shader = Canvas.gl.createShader(type);
          Canvas.gl.shaderSource(shader, source);
          Canvas.gl.compileShader(shader);

          return checkShader(shader);
        });
    }

    const program = Canvas.gl.createProgram(),
          vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
          frgFile = `${V}.${frg}-frg.c`;

    return compileShader(Canvas.gl.VERTEX_SHADER, vrtFile)
      .then((vrtShader) => {
        Canvas.gl.attachShader(program, vrtShader);
        return compileShader(Canvas.gl.FRAGMENT_SHADER, frgFile);
      })
      .then((frgShader) => {
        Canvas.gl.attachShader(program, frgShader);
        Canvas.gl.linkProgram(program);

        if (! Canvas.gl.getProgramParameter(program, Canvas.gl.LINK_STATUS)) {
          var info = Canvas.gl.getProgramInfoLog(program);
          l('Could not link WebGL program' +
            (info ? `:\n\n${info}` : '.'));
          return Helper.rejectPromise('bad program') ;
        }

        return _programs[key].init(program);
      });
  }

  function _createBuffer(gl) {
    
  }

  return {
    load: () => {
      
    }
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
