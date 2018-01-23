const Canvas = (() => {
  const canvas = document.createElement('canvas'),
        gl = canvas.getContext('webgl');

  const loadPromise = () => new Promise((resolve, reject) => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    Body.appendChild(canvas);

    if (!gl) {
      reject('Unable to initialize WebGL; check browser compatibility.');
    }

    resolve();
  });

  /////////////////////////////////////////

  return {
    gl: gl,
    load: () => loadPromise().then(Programs.load),
    render: () => {
      // Clear
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0);                // Clear everything
      gl.enable(gl.DEPTH_TEST);          // Enable depth testing
      gl.depthFunc(gl.LEQUAL);           // Near things obscure
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      Programs.run();
    }
  };
})();


// @NOTE: Dependent on the Canvas being loaded first!
const Programs = (() => {

  const programs = {
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

      let program,
          a_position,
          a_color,
          u_model_matrix,
          positionBuffer,
          colorBuffer;

      const finishInit = (glProgram) => {
        program = glProgram
        a_position = Canvas.gl.getAttribLocation(program, 'a_position');
        a_color = Canvas.gl.getAttribLocation(program, 'a_color');
        u_model_matrix = Canvas.gl.getAttribLocation(program,
                                                     'u_model_matrix');

        positionBuffer = GlProgram.createBuffer(positions);
        colorBuffer = GlProgram.createBuffer(colors);
      };

      return {
        init: () => GlProgram.setup().then(finishInit),
        run:  () => {
          
        }
      };
    })()
  };

  return {
    load: () => programs.test.init(),
    run:  () => programs.test.run()
  };
})();


const GlProgram = (() => {

  // let gl = null;

  // const loadPromise = (canvasGl) => new Promise((resolve, reject) => {
  //   if (canvasGl) {
  //     gl = canvasGl;
  //     resolve();
  //   } else {
  //     reject(Helper.rejectPromise('no gl context'));
  //   }
  // });

  if (!Canvas.gl) {
    e("Canvas must load first to expose it's gl context");
    return false;
  }

  function checkShader(shader) {
    const status = Canvas.gl.getShaderParameter(shader,
                                                Canvas.gl.COMPILE_STATUS);
    if (!status) {
      e('Program error with shader:', Canvas.gl.getShaderInfoLog(shader));
      Canvas.gl.deleteShader(shader);
      return Helper.rejectPromise('a bad shader');
    }

    return shader;
  }

  function compileShader(type, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          let err = 
              l(`Error loading ${url} shader with response: `, response);
          return Helper.rejectPromise(url);
        }

        return response.text();
      })
      .then(source => {
        const shader = Canvas.gl.createShader(type);
        Canvas.gl.shaderSource(shader, source);
        Canvas.gl.compileShader(shader);

        return checkShader(shader);
      });
  }

  function _setup(vrt = 'default', frg = 'default') {
    const program = Canvas.gl.createProgram(),
          vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
          frgFile = `${V}.${frg}-frg.c`;

    return compileShader(Canvas.gl.VERTEX_SHADER, vrtFile)
      .then(vrtShader => {
        Canvas.gl.attachShader(program, vrtShader);
        return compileShader(Canvas.gl.FRAGMENT_SHADER, frgFile);
      })
      .then(frgShader => {
        Canvas.gl.attachShader(program, frgShader);
        Canvas.gl.linkProgram(program);

        if (! Canvas.gl.getProgramParameter(program,
                                            Canvas.gl.LINK_STATUS)) {
          var info = Canvas.gl.getProgramInfoLog(program);
          e('Could not link WebGL program' + (info ? `:\n\n${info}` : '.'));
          return Helper.rejectPromise('bad program') ;
        }

        return program;
      });
  }

  function _createBuffer(data) {
    let buffer = Canvas.gl.createBuffer();
    Canvas.gl.bindBuffer(Canvas.gl.ARRAY_BUFFER, buffer);
    Canvas.gl.bufferData(Canvas.gl.ARRAY_BUFFER, new Float32Array(data),
                         Canvas.gl.STATIC_DRAW);

    return buffer;
  }

  return {
    setup: _setup,
    createBuffer: _createBuffer
  };
})();


const Frame = (() => {

  const update = () => {

  };

  const render = () => {
    Canvas.render();
  };

  return {
    next: (ms) => {
      Game.loop(ms);
      update();
      render();
    }
  };
})();


const V1 = (() => {
  l('Game v1...')

  Game.addLoad('Canvas and Programs', Canvas.load);
  Game.setLoop(Frame.next);
})();
