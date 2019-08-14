var Canvas = (() => {

  return {
    // Methods
    load,

    // Dimensions
    height: 0,
    ratio: 0,
    width: 0,

    // WebGL Context
    glCtx: null,                // it just needs to be passed to
                                // window['GL'] so maybe can be
                                // removed from here
  };

  function load() {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement('canvas');
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      Body.appendChild(canvas);

      this.width = canvas.width;
      this.height = canvas.height;
      let glCtx = canvas.getContext('webgl');
      if (!glCtx) {
        reject('Unable to initialize WebGL check browser compatibility.');
      }
      else {
        this.glCtx = glCtx;
        resolve();
      }
    });
  }
})();
