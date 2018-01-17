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
    function checkShader(shader) {
      const error = ! _gl.getShaderParameter(shader, _gl.COMPILE_STATUS)
      if (error) {
        l('Program error with shader:', _gl.getShaderInfoLog(shader))
        _gl.deleteShader(shader)
        return Helper.fakePromise('a bad shader')
      }

      return shader
    }

    function compileShader(type, url) {
      return fetch(url)
        .then((response) => {
          if (!response.ok) {
            let err = 
            l(`Error loading ${url} shader with response: `, response)
            return Helper.fakePromise(url)
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

    const program = _gl.createProgram(),
          vrtFile = `${V}.${vrt}-vrt.c`, // e.g. v1.default-vrt.c
          frgFile = `${V}.${frg}-frg.c`

    return compileShader(_gl.VERTEX_SHADER,   vrtFile)
      .then((vrtShader) => {
        _gl.attachShader(program, vrtShader)
        return compileShader(_gl.FRAGMENT_SHADER, frgFile)})
      .then((frgShader) => {
        _gl.attachShader(program, frgShader)
        _gl.linkProgram(program)
        Programs.init(_gl, key)
        if (! _gl.getProgramParameter(program, _gl.LINK_STATUS)) {
          var info = _gl.getProgramInfoLog(program)
          l('Could not link WebGL program' +
            (info ? `:\n\n${info}` : '.'))
          return Helper.fakePromise('bad program') 
        }

        return true
      })
  }

  /////////////////////////////////////////

  return {
    load: () => {
      Body.appendChild(_canvas)
      // TODO for each programs...
      return _setupProgram('test')
    },
    render: () => {
      // Clear
      _gl.viewport(0, 0, _canvas.width, _canvas.height)
      _gl.clearColor(0, 0, 0, 1.0)
      _gl.clear(_gl.COLOR_BUFFER_BIT)
    }
  }
})()


const Programs = (() => {

  function _createBuffer(gl) {

  }

  const _keys = {
    test: (() => {
      const positions = [
         0.5,  1,
        -0.5,  1,
         0.5, -1,
        -0.5, -1
      ]

      let a_position,
          u_model_matrix,
          positionBuffer

      return {
        init: (gl, program) => {
          a_position = gl.getAttribLocation(program, 'a_position')
          u_model_matrix = gl.getAttribLocation(program, 'u_model_matrix')

          positionBuffer = _createBuffer(gl)
        },

        run: (gl, program) => {
          
        }
      }
    })()
  }

  return {
    init: (gl, program, key) => _keys[key].init(gl, program),
    run:  (gl, program, key) => _keys[key].run(gl, program)
  }
})()


const Frame = (() => {

  const _update = () => {

  }

  const _render = () => {
    Canvas.render()
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
