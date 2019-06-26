var Programs = (() => {

  var _progs = {};

  return {
    load: function() {
      console.log('hello', V);
      return new Promise((resolve, reject) => {
        _progs['Test'] = Test();
        this.current = _progs['Test'];
        this.current.init()
          .then(foo => { l('hey', foo); resolve(); })
          .catch(bar => { e('boo', bar); reject(); });
      });
    },

    current: null,

    prep: function() { this.current.prep(); }
  };

  function Test() {
    var ms = 0;

    return {
      init: function() {
        return window['GL'].setupProgram().then(finishInit);
      },
      prep: function() {
        update();
        window['GL'].useProgram(program);
        window['GL'].drawArrays('POINTS', 0, 1);
      }
    };

    function finishInit(glProgram) {
      program = glProgram;
    }

    function update() {
      ms += Game.msPassed;
      console.log('updating');
    }
  }
})();
