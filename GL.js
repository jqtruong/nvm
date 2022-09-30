var POINTS = 'POINTS';
var LINE_STRIP = 'LINE_STRIP';
var LINE_LOOP = 'LINE_LOOP';
var LINES = 'LINES';
var TRIANGLE_STRIP = 'TRIANGLE_STRIP';
var TRIANGLE_FAN = 'TRIANGLE_FAN';
var TRIANGLES = 'TRIANGLES';

var GL = (() => {

    var _glCtx = null;
    var _program = null;

    var defaults = {
        // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
        vertexPointer: {
            numComponents: 2,
            type: 'FLOAT',

            // normalize into range when cast into float; haven't seen an
            // example yet of how that works
            normalize: false,

            // stride and offset seem useful when working with BYTEs
            stride: 0,
            offset: 0,
        }
    };

    var VARIANTS = {
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
            _glCtx = window['Canvas'].glCtx;
            this.getAttrib  = _glCtx.getAttribLocation.bind(_glCtx);
            this.getUniform = _glCtx.getUniformLocation.bind(_glCtx);
            this.useProgram = _glCtx.useProgram.bind(_glCtx);
            return Promise.resolve();
        },

        clear: function() {
            _glCtx.viewport(0, 0, window['Canvas'].width, window['Canvas'].height);
            _glCtx.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
            _glCtx.clearDepth(1.0);                // Clear everything
            _glCtx.blendFunc(_glCtx.SRC_ALPHA, _glCtx.ONE);
            _glCtx.enable(_glCtx.BLEND);
            _glCtx.enable(_glCtx.DEPTH_TEST);      // Enable depth testing
            _glCtx.depthFunc(_glCtx.LEQUAL);       // Near things obscure
            _glCtx.clear(_glCtx.COLOR_BUFFER_BIT | _glCtx.DEPTH_BUFFER_BIT);
        },

        createBuffer: function(/* Float32Array */ data) {
            var buffer = _glCtx.createBuffer();
            _glCtx.bindBuffer(_glCtx.ARRAY_BUFFER, buffer);
            _glCtx.bufferData(_glCtx.ARRAY_BUFFER, data, _glCtx.STATIC_DRAW);
            return buffer;
        },

        drawArrays: function(mode, offset, num_verts) {
            return _glCtx.drawArrays(_glCtx[mode], offset, num_verts);
        },

        sendVertices: function (opts, buffer, attr) {
            var { numComponents,
                type,
                normalize,
                stride,
                offset } = {
                    ...defaults.vertexPointer,
                    ...opts
                };

            var glType = _glCtx[type];
            if (VARIANTS.TYPES.includes(type) && glType) {
                _glCtx.enableVertexAttribArray(attr);
                _glCtx.bindBuffer(_glCtx.ARRAY_BUFFER, buffer);
                _glCtx.vertexAttribPointer(attr, numComponents, glType, normalize, stride, offset);
            } else {
                e(`_glCtx.${type} does not exist.`);
            }
        },

        setUniform: function(dim, loc, ...args) {
            var glFunc = _glCtx[`uniform${dim}`];
            if (glFunc) {
                glFunc.apply(_glCtx, [loc, ...args]);
            } else {
                e(`${glFunc}() does not exist.`);
            }
        },

        setupProgram: function (vrt = 'default', frg = 'default') {
            var vrtFile = `shaders/${vrt}-vrt.c`;
            var frgFile = `shaders/${frg}-frg.c`;
            var program = _glCtx.createProgram();

            l('Loading program', { vrtFile, frgFile });

            return compileShader(_glCtx.VERTEX_SHADER, vrtFile)
                .then(shader => attachVertexShader(shader, program))
                .then(() => compileShader(_glCtx.FRAGMENT_SHADER, frgFile))
                .then(shader => attachFragmentShaderEtc(shader, program));
        },

        getAttrib:  null,
        getUniform: null,
        useProgram: null,
    };

    function attachFragmentShaderEtc(frgShader, program) {
        var status = (() => {
            _glCtx.attachShader(program, frgShader);
            _glCtx.linkProgram(program);
            return _glCtx.getProgramParameter(program, _glCtx.LINK_STATUS);
        })();

        if (!status) {
            var info = _glCtx.getProgramInfoLog(program);
            e('Could not link WebGL program' + (info ? `:\n\n${info}` : '.'));
            return Promise.reject('bad program');
        }

        return Promise.resolve(program);
    }

    function attachVertexShader(vrtShader, program) {
        return _glCtx.attachShader(program, vrtShader);
    }

    function checkShader(shader) {
        var status = _glCtx.getShaderParameter(shader, _glCtx.COMPILE_STATUS);
        if (!status) {
            l('Program error with shader:', _glCtx.getShaderInfoLog(shader));
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