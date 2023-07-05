var CH1_X = -.5;
var CH2_X =  .5;
var COLOR1 = [1, .4, .2, .1].toRgba();
var COLOR2 = [.2, .4, 1, .1].toRgba();

var Programs = (() => {

    var PROGRAMS = [
        {
            name: 'programs/channel',
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

        PROGRAMS[0].params.push({ color: COLOR1, vertices: _vertices(ch1, CH1_X) });
        PROGRAMS[0].params.push({ color: COLOR2, vertices: _vertices(ch2, CH2_X) });

        return Promise.resolve('testing');
    }

    function _vertices(ch, x) {
        let ratio = 2/ch.length
        let vertices = '';
        let y = 0;

        ch.forEach((wav, i) => {
            w = x + wav;
            y = 1 - i * ratio;
            vertices += ` ${x} ${y}
                          ${w} ${y} `; // space intended
        });

        let _vertices = vertices.toFloat32Array();
        return vertices.toFloat32Array();
    }

    /* Returns array of program names. */
    function _programNames() {
        return PROGRAMS.map(({ name }) => name);
    }

})();
