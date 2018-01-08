const Canvas = (() => {
  const _canvas = document.createElement('canvas'),
        _gl = _canvas.getContext('webgl'),
        _programs = {}

  var _vertShader, _fragShader

  if (!_gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.')
    return {}
  }

  _canvas.width  = window.innerWidth
  _canvas.height = window.innerHeight

  function _setupProgram(key, vrt = 'default', frg = 'default') {
    const checkShader = (shader) => {
      const error = ! _gl.getShaderParameter(shader, _gl.COMPILE_STATUS)
      if (error) {
        l('Program error with shader:', _gl.getShaderInfoLog(shader))
        _gl.deleteShader(shader)
        return Helpers.fakePromise('a bad shader')
      }

      return shader
    }

    const compileShader = (type, url) => {
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            let err = 
            l(`Error loading ${url} shader with response: `, response)
            return Helpers.fakePromise(url)
          }

          return response.text()
        })
        .then((source) => {
          const shader = _gl.createShader(type)
          _gl.shaderSource(shader, source)
          _gl.compileShader(shader)

          return checkShader(shader)
        })
    }

    const program = _programs[key] = _gl.createProgram(),
          vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
          frgFile = `${V}.${frg}-frg.c`

    return compileShader(_gl.VERTEX_SHADER,   vrtFile)
      .then((shader) => _gl.attachShader(program, shader))
      .then(() => compileShader(_gl.FRAGMENT_SHADER, frgFile))
      .then((shader) => _gl.attachShader(program, shader))
      .then(() => {
        _gl.linkProgram(program)
        if (! _gl.getProgramParameter(program, _gl.LINK_STATUS)) {
          var info = _gl.getProgramInfoLog(program)
          l('Could not link WebGL program' +
            (info ? `:\n\n${info}` : '.'))
          return Helpers.fakePromise('bad program') 
        }
      })
  }

  /////////////////////////////////////////

  return {
    load: () => {
      Body.appendChild(_canvas)
      // TODO for each programs...
      return _setupProgram('test')
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
  l('Game v1...')

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
