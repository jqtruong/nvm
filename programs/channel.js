window[`programs/channel`] = (() => {
    var _uColor = null;
    var _aPosition = null;
    var _program = null;
    var _VPF = 2; // number of vertices per frame

    return {
        init: function() {
            return window['GL'].setupProgram('default', 'colored').then(finishInit);
        },

        render: function({ color, vertices }) {
            window['GL'].useProgram(_program);
            let buffer = window['GL'].createBuffer(vertices);
            window['GL'].sendVertices(null, buffer, _aPosition);
            window['GL'].setUniform(
                '4f',
                _uColor,
                color[0], color[1], color[2], color[3]
            );
            window['GL'].drawArrays(LINES, 0, _frames.length * _VPF);
        },
    };

    function finishInit(glProgram) {
        _uColor = window['GL'].getUniform(glProgram, 'u_color');
        _aPosition = window['GL'].getAttrib(glProgram, 'a_position');
        _program = glProgram;
        return Promise.resolve();
    }

})();
