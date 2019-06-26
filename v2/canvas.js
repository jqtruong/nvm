var Canvas = (() => {

  return {
    load: function load() {
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
    },
    width: 0,
    height: 0,
    glCtx: null,
  };
})();
