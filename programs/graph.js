window[`programs/graph`] = (() => {
    var _channels = 2;
    var _dat = [];
    var _duration = 0;
    var _rate = 44100;
    var _positionLoc = null;
    var _program = null;
    var _vertices = [];

    return {
        init: function() {
            return window['GL'].setupProgram().then(finishInit);
        },

        render: function() {
            window['GL'].useProgram(_program);
            let buffer = window['GL'].createBuffer(_vertices.toFloat32Array());
            window['GL'].sendVertices(null, buffer, _positionLoc);
            window['GL'].drawArrays(LINES, 0, _json.dat.length*2);
        },
    };

    function finishInit(glProgram) {
        _positionLoc = window['GL'].getAttrib(glProgram, 'aPosition');
        _program = glProgram;
        return Load.json('hello')
            .then(json => {
                if (!json) return;
                if (json.channels) _channels = json.channels;
                if (json.dat     ) _dat      = json.dat;
                if (json.duration) _duration = json.duration;
                if (json.rate    ) _rate     = json.rate;

                // i want to interpolate the total frames from -1 to 1 on the y-axis?
                // yes, unless specified to a different duration,

                _frames = Math.interpolate({
                    input: [0, _duration],
                    precision: 5,
                });

                console.log(_frames);
                return Promise.reject('testing');
                //     .forEach((frame, i) => {
                //     var [_, ch1, ch2] = _dat[i];
                //     _vertices.push(`     0 ${frame}
                //                     ${ch1} ${frame}`);
                // });

                return _program;
            });
    }

})();
