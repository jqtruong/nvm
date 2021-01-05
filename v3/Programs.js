const PROGRAMS = [{
  name: 'programs/sine-wave',
  params: [
    ['POINTS'   , 0, 1, -.45],
  ],
}];

var Programs = (() => {

  return {
    load,
    run,
  };

  ////////////////////////////////////////////////////////////////////////////////

  function load() {
    l({PROGRAMS});
    const programs = PROGRAMS.map(({ name }) => name);
    return window['Load'].scripts(programs, 'init');
  }

  function run() {
    PROGRAMS.forEach(_runWithParams);
  }

  function _runWithParams({ name, params }) {
    return params.forEach(p => window[name].render.call(null, p));
  }

})();
