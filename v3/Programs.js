const PROGRAMS = [{
  name: 'programs/sine-wave',
  params: [],
}];

var Programs = (() => {

  return {
    load,
    run,
  };

  ////////////////////////////////////////////////////////////////////////////////

  function load() {
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
