var Game = (() => {
  let _id = 0;                  // request frame id
  let _loads = [];
  let _looper = () => l("i am not a loop");
  let _msPassed = 0;
  let _lastMs   = 0;

  return {
    points: 0,
    zeroth: () => Math.ceil(_lastMs*60/1000)%60 == 0,

    addLoad: entry => {
      let name = entry[0],
          obj = entry[1],
          loader = obj.load;

      _loads.push({
        name,
        promise: () => loader.call(obj)
          .then(result => {
            l(`${name} loaded`);
            l(obj);
            return result;
          })
          .catch(msg => {
            e(`Error: loading ${name}: ${msg}.`);
            return Promise.reject('failure to load');
          })
      });
    },
    addLoads: function(loads) {
      Object.entries(loads).forEach(entry => this.addLoad(entry));
    },
    load: () => Promise.resolve(),
    loop: function(ms) {
      this.msPassed = ms - _lastMs;
      _lastMs = ms;
      _id = window.requestAnimationFrame(_looper);
    },

    msPassed: 0,

    start: function() {
      l('Game v1...');
      setLoop(window['Frame'].next);
      this.loop(0);
    },
    stop: () => {
      window.cancelAnimationFrame(_id);
      return _id;
    }
  };

  function setLoop(f) {
    _looper = f;
  }

})();
