const Canvas = (() => {
  const canvas = document.createElement('canvas');

  function loadPromise() {
    return new Promise((resolve, reject) => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      Body.appendChild(canvas);

      this.width = canvas.width;
      this.height = canvas.height;

      this.gl = canvas.getContext('webgl');

      if (!this.gl) {
        reject('Unable to initialize WebGL; check browser compatibility.');
      }

      resolve(this.gl);
    });
  }

  /////////////////////////////////////////

  return {
    gl: null,                   // @TODO: remove in favor of Gl
    width: 0,
    height: 0,
    load: () => loadPromise.call(Canvas)
  };
})();


const Gl = (() => {
  let gl = null;

  return {
    load: function(glFromCanvas) {
      gl = glFromCanvas;
      this.getAttrib = gl.getAttribLocation;
      this.getUniform = gl.getUniformLocation;
      return true;
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
    getAttrib: null,
    getUniform: null
  };
})();


// @NOTE: Dependent on the Canvas being loaded first!
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
        init: function() { return GlProgram.setup().then(finishInit) },
        prep:  function() {
          const gl = Canvas.gl;
          const numComponents = 2;
          const type = gl.FLOAT;
          const normalize = false;
          const stride = 0;
          const offset = 0;
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.vertexAttribPointer(a_position,
                                 numComponents,
                                 type,
                                 normalize,
                                 stride,
                                 offset);
          gl.enableVertexAttribArray(a_position);

          gl.useProgram(program);
          gl.uniformMatrix4fv(u_model_matrix,
                              false,
                              `1  0  0  0
                               0  1  0  0
                               0  0 -6  0
                               0  0  0  1`.toFloat32Array());
          gl.uniformMatrix4fv(u_projection_matrix,
                              false,
                              Matrix.projection);
          // @TODO draw here
          Canvas.gl.drawArrays(Canvas.gl.TRIANGLE_STRIP, 0, 4);
        }
      };
    })()
  };

  return {
    load: programs.test.init,
    prep: programs.test.prep
  };
})();


const GlProgram = (() => {

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
    const gl = Canvas.gl,
          program = gl.createProgram(),
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
  }

  return {
    setup: _setup
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
      .then(Gl.load)
      .then(Programs.load)
      .then(Matrix.load)
  });

  Game.setLoop(Frame.next);
})();
