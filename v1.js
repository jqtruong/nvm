const Canvas = (() => {
  var _c = document.createElement('canvas'),
      _x = _c.getContext('2d')

  _c.width  = window.innerWidth
  _c.height = window.innerHeight

  /////////////////////////////////////////
  // CanvasRenderingContext2D Prototypes //
  /////////////////////////////////////////
  _.clear = () => {
    _x.clearRect(0, 0, _c.width, _c.height)
    return _x
  }

  _.draw = () => {
    return _x
  }

  /////////////////////////////////////////

  return {
    load: () => Body.appendChild(_c),
    ctx: _x
  }
})()


const Frame = (() => {

  const _update = () => {

  }

  const _render = () => {
    Canvas.ctx
      .clear()
      .draw()
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


var Test = (() => {
  function deLoop(ms) {
    Game.loop(deLoop)
  }

  return {
    go: () => Game.loop(deLoop)
  }
})()

Test.go()
