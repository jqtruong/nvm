var Events = (() => {

  return {
    load: function() {
      window.onkeyup = (e) => {
        switch (e.keyCode) {

        case 27:                      // esc
          l(`stopped game at ${Game.stop()}`);
          break;

        default:
          l('Keycode:', e.keyCode);
        }
      };

      return Promise.resolve();
    }
  };
})();
