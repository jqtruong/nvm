const Canvas = (() => {
  const _canvas = document.createElement('canvas'),
        _gl = _canvas.getContext('webgl'),
        _program = _gl.createProgram()

  var _vertShader, _fragShader

  if (!_gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.')
    return {}
  } else {
    
  }

  _canvas.width  = window.innerWidth
  _canvas.height = window.innerHeight

  function _init() {
    _programSetup()
    
    return 'Failed to init.'
  }

  function _programSetup() {
    // Attach pre-existing shaders
    gl.attachShader(_program, _loadShader(gl.VERTEX_SHADER,   'v1.vert.c'))
    gl.attachShader(_program, _loadShader(gl.FRAGMENT_SHADER, 'v1.frag.c'))

    gl.linkProgram(_program)

    if (!gl.getProgramParameter(_program, gl.LINK_STATUS)  {
      var info = gl.getProgramInfoLog(_program)
      throw `Could not compile WebGL program.\n\n${info}`
    }
  }

  function _loadShader(type, url) {
    return fetch(url)
      .then((response) => {
        console.log(response)
        response ? response.text : false
      })
      .then(source => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
          gl.deleteShader(shader);
          return null;
        }

        return shader;
      })
  }

  /////////////////////////////////////////

  return {
    load: () => {
      Body.appendChild(_canvas)
      return _init()
    },
    doSomething: () => l('canvas doSomething stub')
  }
})()


const Frame = (() => {

  const _update = () => {

  }

  const _render = () => {
    Canvas.doSomething()
  }

  return {
    next: (ms) => {
      Game.loop(ms)
      _update()
      _render()
    }
  }
})()


const V1 = (() => {
  console.log('Game v1...')

  Game.addLoad('Canvas', Canvas.load)
  Game.setLoop(Frame.next)
})()

// 
// var Test = (() => {
//   function deLoop(ms) {
//     Game.loop(deLoop)
//   }

//   return {
//     go: () => Game.loop(deLoop)
//   }
// })()

// Test.go()
