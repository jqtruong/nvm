const PROGRAMS = [
  {
    name: 'programs/sine-wave',
    params: [
      ['POINTS', 0, 1, -.5],
      ['POINTS', 0, 1,  .5],
    ],
  },
  {
    name: 'programs/lines',
    params: [
      [-.5],
    ],
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
    PROGRAMS.forEach(_runProgramWithParams);
  }

  /* Call program-by-name's render with associated params, pertaining
  to a GL draw mode. */
  function _runProgramWithParams({ name, params }) {
    return params.forEach(p => window[name].render.call(null, p));
  }

  /* Returns array of program names. */
  function _programNames() {
    return PROGRAMS.map(({ name }) => name);
  }

})();
