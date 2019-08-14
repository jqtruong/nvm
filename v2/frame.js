var Frame = (() => {

  return {
    load: function() {
      return Promise.resolve();
    },
    next: function(ms) {
      Game.loop(ms);
      render();
    }
  };

  function render() {
    window['GL'].clear();
    window['Programs'].renderAll();
  }

})();
