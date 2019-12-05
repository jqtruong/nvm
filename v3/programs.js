var Programs = (() => {

  var _runners = [];            // GL Programs ready to run.

  //
  // `_progs` is an object relating programs to parameters.
  //
  // The naming scheme and directory structure below might be a bit
  // redundant.
  //
  var _progs = {
    'programs/drawing-modes':   [
      ['POINTS'   , 0, 1, -.45],
      ['POINTS'   , 0, 1,  .45],
      ['TRIANGLES', 0, 3, -.25],
      ['TRIANGLES', 0, 3,  .25],
    ],
    'programs/drawing-modes-2': [
      ['POINTS'   , 0, 1, -.55],
      ['POINTS'   , 0, 1,  .55],
      ['TRIANGLES', 0, 3, -.35],
      ['TRIANGLES', 0, 3,  .35],
    ],
  };

  return {
    load,
    renderAll,
  };

  ////////////////////////////////////////////////////////////////////////////////

  function load() {
    return Promise.all(PROGRAMS.map(key => window[key].init()));
  }

  function renderAll() {
    PROGRAMS.forEach(key => {
      _progs[key].forEach(params => {
        window[key].render.call(null, params);
      });
    });
  }

})();
