const PROGRAMS = [
    {
      name: 'programs/graph',
    },
];

var Programs = (() => {

  return {
    load,
    run,
  };

  ////////////////////////////////////////////////////////////////////////////////

  function load() {
    l({PROGRAMS});
    const programs = _programNames();
    return window['Load'].scripts(programs, 'init');
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

  /* Returns array of program names. */
  function _programNames() {
    return PROGRAMS.map(({ name }) => name);
  }

})();
