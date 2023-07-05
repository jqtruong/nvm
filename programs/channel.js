/*
 * draw one channel's WAV values.
 */
window[`programs/channel`] = (() => {
    var _uColor = null;
    var _aPosition = null;
    var _program = null;

    return {
        init: function() {
            return window['GL'].setupProgram( 'default', 'colored')
                               .then(finishInit);
        },

        render: function({ color, vertices }) {
            window['GL'].useProgram(_program);
            let buffer = window['GL'].createBuffer(vertices);
            window['GL'].sendVertices(null, buffer, _aPosition);
            window['GL'].setUniform(
                '4f',
                _uColor,
                color.r, color.g, color.b, color.a
            );
            window['GL'].drawArrays(LINES, 0, vertices.length/2);
        },
    };

    function finishInit(glProgram) {
        _uColor = window['GL'].getUniform(glProgram, 'u_color');
        _aPosition = window['GL'].getAttrib(glProgram, 'a_position');
        _program = glProgram;
        return Promise.resolve();
    }

})();
