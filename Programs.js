var Programs = (() => {

    var color1 = [1, .4, .2, .1].toRgba();
    var color2 = [.2, .4, 1, .1].toRgba();

    var PROGRAMS = [
        {
            name: 'programs/channel',
            params: [
                {
                    color: color1,
                    vertices: null,
                },
                {
                    color: color2,
                    vertices: null,
                },
                {
                    color: color1,
                    vertices: null,
                },
                {
                    color: color2,
                    vertices: null,
                },
            ],
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
            .then(json => _parseJson(json, [0, 1]))
            .then(() => Load.json('agad'))
            .then(json => _parseJson(json, [2, 3]))
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

    function _parseJson(json, paramIds) {
        if (!json) return Promise.reject('no json');

        var frames = Math.interpolate.range({
            input: [0, json.duration],
            output:[1, -1],
            step: 1/json.rate,
        });

        l(Math.interpolate.value({
            offset: -1,
            i: 1,
            ratio: 1,
        }));

        // PROGRAMS[0].params[paramIds[0]].vertices =
        // PROGRAMS[0].params[paramIds[1]].vertices =

        return Promise.resolve('testing');
    }

    /* Returns array of program names. */
    function _programNames() {
        return PROGRAMS.map(({ name }) => name);
    }

})();
