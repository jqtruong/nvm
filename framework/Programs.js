var CH1_X = 0; //-.5;
var CH2_X = 0; // .5;
var COLOR_1 = [.1, .4, .2, .1].toRgba();
var COLOR_2 = [.2, .4, 1, .1].toRgba();
var COLOR_RED = [1, 0, 0, .5].toRgba();
var COLOR_GREEN = [0, 1, 0, .5].toRgba();
var COLOR_BLUE = [0, 0, 1, .5].toRgba();

var Programs = (() => {

    var PROGRAMS = [
        {
            name: '../programs/channel',
            params: [],
        },
    ];

    return {
        load,
        run,
    };

    ////

    function load() {
        l({PROGRAMS});
        const programs = _programNames();
        return Load.json('adele')
            .then(json => _parseJson(json))
            // .then(() => Load.json('agad'))
            // .then(json => _parseJson(json, [2, 3]))
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

        var [ ch1, ch2 ] = json;

        PROGRAMS[0].params.push({ color: COLOR_1, vertices: _vertices(ch1, CH1_X) });
        PROGRAMS[0].params.push({ color: COLOR_2, vertices: _vertices(ch2, CH2_X) });

        return Promise.resolve('testing');
    }

    function _vertices(ch, x) {
        var ratio = 2/ch.length
        var vertices = '';

        ch.forEach((wav, i) => {
            var w = x + wav;
            var y = 1 - i * ratio;
            vertices += ` ${x} ${y}
                          ${w} ${y} `; // space intended
        });

        return vertices.toFloat32Array();
    }

    /* Returns array of program names. */
    function _programNames() {
        return PROGRAMS.map(({ name }) => name);
    }

})();
