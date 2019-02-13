const Canvas = (() => {
  const canvas = document.createElement('canvas');

  return {
    width: 0,
    height: 0,
    glCtx: null,
    load
  };

  ////////////////////////////////////////////////////////////////////////////////

  function load() {
    return new Promise((resolve, reject) => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      Body.appendChild(canvas);

      this.width = canvas.width;
      this.height = canvas.height;
      let glCtx = canvas.getContext('webgl');
      if (!glCtx) {
        reject('Unable to initialize WebGL check browser compatibility.');
      }
      else {
        this.glCtx = glCtx;
        resolve();
      }
    });
  }  
  
})();

const Gl = (() => {
  let glCtx = null;

  const defaults = {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    vertexPointer: {
      numComponents: 2,
      type: 'FLOAT',
      normalize: false,
      stride: 0,
      offset: 0,
    }
  };

  const CONSTANTS = {
    DRAW_MODES: [
      'POINTS',
      'LINE_STRIP',
      'LINE_LOOP',
      'LINES',
      'TRIANGLE_STRIP',
      'TRIANGLE_FAN',
      'TRIANGLES'
    ],
    TYPES: [
      'BYTE',
      'SHORT',
      'UNSIGNED_BYTE',
      'UNSIGNED_SHORT',
      'FLOAT'
    ]
  };

  return {
    load: function() {
      return new Promise((resolve, reject) => {
        glCtx = Canvas.glCtx;
        this.getAttrib  = glCtx.getAttribLocation.bind(glCtx);
        this.getUniform = glCtx.getUniformLocation.bind(glCtx);
        this.useProgram = glCtx.useProgram.bind(glCtx);
        if (!(this.useProgram ||
              this.getUniform ||
              this.getAttrib)) {
          reject('Gl did not initiate properly.');
        }
        else resolve();
      });
    },
    clear: function() {
      glCtx.viewport(0, 0, Canvas.width, Canvas.height);
      glCtx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      glCtx.clearDepth(1.0);                // Clear everything
      glCtx.enable(glCtx.DEPTH_TEST);       // Enable depth testing
      glCtx.depthFunc(glCtx.LEQUAL);        // Near things obscure
      glCtx.clear(glCtx.COLOR_BUFFER_BIT | glCtx.DEPTH_BUFFER_BIT);
    },
    createBuffer: function(/* Float32Array */ data) {
      let buffer = glCtx.createBuffer();
      glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffer);
      glCtx.bufferData(glCtx.ARRAY_BUFFER, data, glCtx.STATIC_DRAW);
      return buffer;
    },
    getAttrib:  null,
    getUniform: null,
    useProgram: null,

    setupProgram: function (vrt = 'default', frg = 'default') {
      const program = glCtx.createProgram(),
            vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
            frgFile = `${V}.${frg}-frg.c`;

      return compileShader(glCtx.VERTEX_SHADER, vrtFile)
        .then(vrtShader => {
          glCtx.attachShader(program, vrtShader);
          return compileShader(glCtx.FRAGMENT_SHADER, frgFile);
        })
        .then(frgShader => {
          const status = (() => {
            glCtx.attachShader(program, frgShader);
            glCtx.linkProgram(program);
            return glCtx.getProgramParameter(program, glCtx.LINK_STATUS);
          })();
          if (!status) {
            var info = glCtx.getProgramInfoLog(program);
            e('Could not link WebGL program' + (info ? `:\n\n${info}` : '.'));
            return Promise.reject('bad program');
          }
          return program;
        });
    },

    sendVertices: function (opts, buffer, attr) {
      let { numComponents,
            type = 'FLOAT',
            normalize,
            stride,
            offset } = Object.assign({}, defaults.vertexPointer, opts);

      const glType = glCtx[type];
      if (CONSTANTS.TYPES.includes(type) && glType) {
        glCtx.enableVertexAttribArray(attr);
        glCtx.bindBuffer(glCtx.ARRAY_BUFFER, buffer);
        glCtx.vertexAttribPointer(attr, numComponents, glType, normalize,
                               stride, offset);
      } else {
        e(`glCtx.${type} does not exist.`);
      }        
    },
    setUniform: function(type, loc, matrix, transpose = false) {
      const glFun = glCtx[`uniformMatrix${type}`].bind(glCtx);
      if (glFun) {
        glFun(loc, transpose, matrix);
      } else {
        e(`glCtx.uniformMatrix${type}() does not exist.`);
      }
    },
    drawArrays: function(mode, offset, count) {
      const glMode = glCtx[mode];
      if (CONSTANTS.DRAW_MODES.includes(mode) && glMode) {
        glCtx.drawArrays(glMode, offset, count);
      } else {
        e(`glCtx.${mode} does not exist.`);
      }
    }
  };

  ////////////////////////////////////////////////////////////////////////////////

  function checkShader(shader) {
    const status = glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS);
    if (!status) {
      e('Program error with shader:', glCtx.getShaderInfoLog(shader));
      glCtx.deleteShader(shader);

      return Promise.reject('a bad shader');
    }

    return shader;
  }

  function compileShader(type, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          let err = l(`Error loading ${url} shader with response: `,
                      response);

          return Promise.reject(url);
        }

        return response.text();
      })
      .then(source => {
        const shader = glCtx.createShader(type);
        glCtx.shaderSource(shader, source);
        glCtx.compileShader(shader);

        return checkShader(shader);
      });
  }
})();

const Programs = (() => {

  const programs = {
    test: (() => {
      let w = 50, h = 100, r = w/2, l = -r, t = 0, b = h;

      const positions = `${l} ${t}
                         ${r} ${t}
                         ${l} ${b}
                         ${l} ${b}
                         ${r} ${t}
                         ${r} ${b}`.toFloat32Array();

      const colors = `1  1  1  1
                      1  0  0  1
                      0  1  0  1
                      0  0  1  1`.toFloat32Array();

      let program,
          a_position,
          a_color,
          u_model_matrix, model,
          u_projection_matrix,
          positionBuffer,
          colorBuffer,
          ms = 0,
          angle = 1;

      const finishInit = (glProgram) => {
        program = glProgram;

        a_position = Gl.getAttrib(program, 'a_position');
        a_color = Gl.getAttrib(program, 'a_color');

        u_model_matrix = Gl.getUniform(program, 'u_model_matrix');
        u_projection_matrix = Gl.getUniform(program, 'u_projection_matrix');

        positionBuffer = Gl.createBuffer(positions);
        colorBuffer = Gl.createBuffer(colors);
      };

      const update = () => {
        ms += Game.msPassed;
        if (ms > 33) {
          model
            .rotate(0, angle)
            .translate((Canvas.width - w)/2,
                       Canvas.height/2);
          ms = 0;
        }
      };

      return {
        init: function() {
          model = Matrix.new()
          return Gl.setupProgram().then(finishInit);
        },
        prep: function() {
          update();
          Gl.sendVertices({}, positionBuffer, a_position);
          Gl.useProgram(program);
          Gl.setUniform('4fv', u_model_matrix, model.matrix);
          Gl.setUniform('4fv', u_projection_matrix, Matrix.projection);
          Gl.drawArrays('TRIANGLES', 0, 6);
        }
      }
    })()
  };

  return {
    load: programs.test.init,
    prep: programs.test.prep
  };
})();

const Frame = (() => {

  function render() {
    Gl.clear();
    Programs.prep();
  }

  return {
    next: function(ms) {
      Game.loop(ms);
      render();
    }
  };
})();

const V1 = (() => {
  l('Game v1...');

  Game.newLoad({Canvas, Gl, Programs, Matrix});

  // Game.addLoad('Canvas and Programs', function() {
  //   return Canvas.load()
  //     .then(Gl.load.bind(Gl))
  //     .then(Programs.load)
  //     .then(Matrix.load.bind(Matrix));
  // });

  Game.setLoop(Frame.next);
})();
