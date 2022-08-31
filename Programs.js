const PROGRAMS = [
    {
        name: 'programs/channel',
        params: [
            {
                color: [1, .4, .2, .1],
                vertices: null,
            },
            {
                color: [.2, .4, 1, .1],
                vertices: null,
            },
        ],
    },
];

var Programs = (() => {

    return {
        load,
        run,
    };

    ////

    function load() {
        l({PROGRAMS});
        const programs = _programNames();
        return Load.json('adele')
            .then(_parseJson)
            .then(() => window['Load'].scripts(programs, 'init'));
    }

    function run() {
        PROGRAMS.forEach(_runProgram);
    }

    /*
     * Call program-by-name's render with associated params, pertaining to a GL draw
     * mode.
     */
    function _runProgram({ name, params }) {
        if (params) {
            return params.forEach(data => window[name].render.call(null, data));
        }
        else {
            return window[name].render();
        }
    }

    function _parseJson(json) {
        if (!json) return Promise.reject('no json');

        if (json.channels) _channels = json.channels;
        if (json.dat) _dat = json.dat;
        if (json.duration) _duration = json.duration;
        if (json.rate) _rate = json.rate;

        var options = {
            input: [0, _duration],
            output:[1, -1],
            step: 1/_rate,
        }
        _frames = Math.interpolate(options);

        var ch1Verts = '';
        var ch2Verts = '';

        _frames.forEach((frame, i) => {
            var [_, ch1, ch2] = _dat[i];
            ch1Verts += `     0 ${frame}
                         ${ch1} ${frame}`;
            ch2Verts += `     0 ${frame}
                         ${ch2} ${frame}`;
        });

        PROGRAMS[0].params[0].vertices = ch1Verts.toFloat32Array();
        PROGRAMS[0].params[1].vertices = ch2Verts.toFloat32Array();

        return Promise.resolve();
    }

    /* Returns array of program names. */
    function _programNames() {
        return PROGRAMS.map(({ name }) => name);
    }

})();
