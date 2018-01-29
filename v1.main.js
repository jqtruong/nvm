const Canvas = (() => {
  const canvas = document.createElement('canvas');

  function loadPromise() {
    return new Promise((resolve, reject) => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      Body.appendChild(canvas);

      this.width = canvas.width;
      this.height = canvas.height;

      const gl = canvas.getContext('webgl');

      if (!gl) {
        reject('Unable to initialize WebGL; check browser compatibility.');
      }

      resolve(gl);
    });
  }

  /////////////////////////////////////////

  return {
    width: 0,
    height: 0,
    load: () => loadPromise.call(Canvas)
  };
})();


const Gl = (() => {
  let gl = null;

  const defaults = {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    vertexPointer: {
      numComponents: 2,
      type: 'FLOAT',
      normalize: false,
      stride: 0,
      offset: 0,
    }
  }

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

  function checkShader(shader) {
    const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!status) {
      e('Program error with shader:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return Helper.rejectPromise('a bad shader');
    }
    return shader;
  }

  function compileShader(type, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          let err = l(`Error loading ${url} shader with response: `,
                      response);
          return Helper.rejectPromise(url);
        }
        return response.text();
      })
      .then(source => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return checkShader(shader);
      });
  }

  return {
    load: function(glFromCanvas) {
      gl = glFromCanvas;
      // this.getAttrib  = (p, n) => gl.getAttribLocation(p, n);
      // this.getUniform = (p, n) => gl.getUniformLocation(p, n);
      // this.useProgram = (p) => gl.useProgram(p);
      this.getAttrib  = gl.getAttribLocation.bind(gl);
      this.getUniform = gl.getUniformLocation.bind(gl);
      this.useProgram = gl.useProgram.bind(gl);
      if (!(this.useProgram ||
            this.getUniform ||
            this.getAttrib)) {
        return Helper.rejectPromise('Gl');
      }
    },
    clear: () => {
      gl.viewport(0, 0, Canvas.width, Canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      gl.clearDepth(1.0);                // Clear everything
      gl.enable(gl.DEPTH_TEST);          // Enable depth testing
      gl.depthFunc(gl.LEQUAL);           // Near things obscure
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    },
    createBuffer: (/* Float32Array */ data) => {
      let buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data,gl.STATIC_DRAW);
      return buffer;
    },
    getAttrib:  null,
    getUniform: null,
    useProgram: null,

    setupProgram: (vrt = 'default', frg = 'default') => {
      const program = gl.createProgram(),
            vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
            frgFile = `${V}.${frg}-frg.c`;

      return compileShader(gl.VERTEX_SHADER, vrtFile)
        .then(vrtShader => {
          gl.attachShader(program, vrtShader);
          return compileShader(gl.FRAGMENT_SHADER, frgFile);
        })
        .then(frgShader => {
          gl.attachShader(program, frgShader);
          gl.linkProgram(program);
          const status = gl.getProgramParameter(program, gl.LINK_STATUS)
          if (! status) {
            var info = gl.getProgramInfoLog(program);
            e('Could not link WebGL program' + (info ? `:\n\n${info}` : '.'));
            return Helper.rejectPromise('bad program') ;
          }
          return program;
        });
    },

    sendVertices: (opts, buffer, attr) => {
      let { numComponents,
            type = 'FLOAT',
            normalize,
            stride,
            offset } = Object.assign({}, defaults.vertexPointer, opts);

      const glType = gl[type]
      if (CONSTANTS.TYPES.includes(type) && glType) {
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attr, numComponents, glType, normalize, stride, offset);
        gl.enableVertexAttribArray(attr);
      } else {
        e(`gl.${type} does not exist.`);
      }        
    },
    setUniform: (type, loc, matrix, transpose = false) => {
      const glFun = gl[`uniformMatrix${type}`].bind(gl);
      if (glFun) {
        glFun(loc, transpose, matrix);
      } else {
        e(`gl.uniformMatrix${type}() does not exist.`);
      }
    },
    drawArrays: (mode, offset, count) => {
      const glMode = gl[mode];
      if (CONSTANTS.DRAW_MODES.includes(mode) && glMode) {
        gl.drawArrays(glMode, offset, count);
      } else {
        e(`gl.${mode} does not exist.`);
      }
    }
  };
})();


const Programs = (() => {

  const programs = {
    test: (() => {
      const positions = ` 0.5  1
                         -0.5  1
                          0.5 -1
                         -0.5 -1`.toFloat32Array();

      const colors = `1  1  1  1
                      1  0  0  1
                      0  1  0  1
                      0  0  1  1`.toFloat32Array();

      let program,
          a_position,
          a_color,
          u_model_matrix,
          u_view_matrix,
          u_projection_matrix,
          positionBuffer,
          colorBuffer;

      const finishInit = (glProgram) => {
        program = glProgram;

        a_position = Gl.getAttrib(program, 'a_position');
        a_color = Gl.getAttrib(program, 'a_color');

        u_model_matrix = Gl.getUniform(program, 'u_model_matrix');
        u_view_matrix = Gl.getUniform(program, 'u_view_matrix');
        u_projection_matrix = Gl.getUniform(program, 'u_projection_matrix');

        positionBuffer = Gl.createBuffer(positions);
        colorBuffer = Gl.createBuffer(colors);
      };

      return {
        init: function() { return Gl.setupProgram().then(finishInit) },
        prep: function() {
          Gl.sendVertices({}, positionBuffer, a_position);
          Gl.useProgram(program);
          Gl.setUniform('4fv', u_model_matrix,
                        `1  0  0  0
                         0  1  0  0
                         0  0 -6  0
                         0  0  0  1`.toFloat32Array());
          Gl.setUniform('4fv', u_projection_matrix, Matrix.projection);
          Gl.drawArrays('TRIANGLE_STRIP', 0, 4);
        }
      };
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
  l('Game v1...')

  Game.addLoad('Canvas and Programs', function() {
    return Canvas.load()
      .then(Gl.load.bind(Gl))
      .then(Programs.load)
      .then(Matrix.load)
  });

  Game.setLoop(Frame.next);
})();
