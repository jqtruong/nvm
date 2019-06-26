var GL = (() => {

  var _glCtx = null;
  var _program = null;

  var defaults = {
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
    vertexPointer: {
      numComponents: 2,
      type: 'FLOAT',
      normalize: false,
      stride: 0,
      offset: 0,
    }
  };

  var VARIANTS = {
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
        if (!window['Canvas'].glCtx) reject('no gl');
        else {
          _glCtx = window['Canvas'].glCtx;
          this.getAttrib  = _glCtx.getAttribLocation.bind(_glCtx);
          this.getUniform = _glCtx.getUniformLocation.bind(_glCtx);
          this.useProgram = _glCtx.useProgram.bind(_glCtx);
          if (this.useProgram && this.getUniform && this.getAttrib) {
            resolve();
          }
          else {
            reject('Gl did not initiate properly.');
          }
        }
      });
    },

    clear: function() {
      _glCtx.viewport(0, 0, window['Canvas'].width, window['Canvas'].height);
      _glCtx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
      _glCtx.clearDepth(1.0);                // Clear everything
      _glCtx.enable(_glCtx.DEPTH_TEST);       // Enable depth testing
      _glCtx.depthFunc(_glCtx.LEQUAL);        // Near things obscure
      _glCtx.clear(_glCtx.COLOR_BUFFER_BIT | _glCtx.DEPTH_BUFFER_BIT);
    },

    createBuffer: function(/* Float32Array */ data) {
      var buffer = _glCtx.createBuffer();
      _glCtx.bindBuffer(_glCtx.ARRAY_BUFFER, buffer);
      _glCtx.bufferData(_glCtx.ARRAY_BUFFER, data, _glCtx.STATIC_DRAW);
      return buffer;
    },
    getAttrib:  null,
    getUniform: null,
    useProgram: null,

    drawArrays: function(mode, offset, count) {
      var glMode = _glCtx[mode];
      if (VARIANTS.DRAW_MODES.includes(mode)) {
        _glCtx.drawArrays(glMode, offset, count);
      } else {
        e(`_glCtx.${mode} does not exist.`);
      }
    },

    sendVertices: function (opts, buffer, attr) {
      var { numComponents,
            type = 'FLOAT',
            normalize,
            stride,
            offset } = Object.assign({}, defaults.vertexPointer, opts);

      var glType = _glCtx[type];
      if (VARIANTS.TYPES.includes(type) && glType) {
        _glCtx.enableVertexAttribArray(attr);
        _glCtx.bindBuffer(_glCtx.ARRAY_BUFFER, buffer);
        _glCtx.vertexAttribPointer(attr, numComponents, glType, normalize,
                               stride, offset);
      } else {
        e(`_glCtx.${type} does not exist.`);
      }        
    },

    setUniform: function(type, loc, matrix, transpose = false) {
      var glFun = _glCtx[`uniformMatrix${type}`].bind(_glCtx);
      if (glFun) {
        glFun(loc, transpose, matrix);
      } else {
        e(`_glCtx.uniformMatrix${type}() does not exist.`);
      }
    },

    setupProgram: function (vrt = 'default', frg = 'default') {
      var vrtFile = `${V}/${vrt}-vrt.c`;
      var frgFile = `${V}/${frg}-frg.c`;

      _program = _glCtx.createProgram()

      return compileShader(_glCtx.VERTEX_SHADER, vrtFile)
        .then(attachVertexShader)
        .then(() => compileShader(_glCtx.FRAGMENT_SHADER, frgFile))
        .then(attachFragmentShader);
    },
  };

  function attachFragmentShader(frgShader) {
    var status = (() => {
      _glCtx.attachShader(_program, frgShader);
      _glCtx.linkProgram(_program);
      return _glCtx.getProgramParameter(_program, _glCtx.LINK_STATUS);
    })();

    if (!status) {
      var info = _glCtx.getProgramInfoLog(_program);
      e('Could not link WebGL program' + (info ? `:\n\n${info}` : '.'));
      return Promise.reject('bad program');
    }

    return _program;
  }

  function attachVertexShader(vrtShader) {
    return _glCtx.attachShader(_program, vrtShader);
  }

  function checkShader(shader) {
    var status = _glCtx.getShaderParameter(shader, _glCtx.COMPILE_STATUS);
    if (!status) {
      e('Program error with shader:', _glCtx.getShaderInfoLog(shader));
      _glCtx.devareShader(shader);

      return Promise.reject('a bad shader');
    }

    return shader;
  }

  function compileShader(type, url) {
    return fetch(url)
      .then(response => {
        if (!response.ok) {
          var err = l(`Error loading ${url} shader with response: `,
                      response);

          return Promise.reject(url);
        }

        return response.text();
      })
      .then(source => {
        var shader = _glCtx.createShader(type);
        _glCtx.shaderSource(shader, source);
        _glCtx.compileShader(shader);

        return checkShader(shader);
      });
  }
})();
