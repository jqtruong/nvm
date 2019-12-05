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
    return Helper.loadPrograms(PROGRAMS);
  }

  function run() {
    PROGRAMS.forEach(_runWithParams);
  }

  function _runWithParams({ name, params }) {
    return params.forEach(p => window[name].render.call(null, p));
  }

})();
