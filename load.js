const Head = document.getElementsByTagName('head')[0],
      Body = document.body,
      l = console.log,
      e = console.error

let N = 0,
    V = ''


window.onload = (e) => {
  console.log('main load')

  N = new URLSearchParams(location.search).get('v') || 1
  V = `v${N}`

  // Load JS and CSS
  Helper.loadScript('main')
    .then(() => Helper.loadScript('design'))
    .then(() => new Promise((ok, argh) => {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = `${V}.css`
      link.onload = () => ok(true)

      Head.appendChild(link)
    }))
    .then(() => Game.load())
    // .then(() => Game.start())
    .catch(err => l(`Game could not start due to ${err}.`))
}


var Helper = (function() {

  var d = document

  return {
    rejectPromise: (msg) => new Promise((res, rej) => rej(msg)),
    getById: (id) => d.getElementById(id),
    get1ByTag: (name) => d.getElementsByTagName(name)[0],
    getAllByTag: (name) => d.getElementsByTagName(name),
    loadScript: (name) => new Promise((ok, argh) => {
      var script = document.createElement('script')
      script.src = `${V}.${name}.js`
      script.onload = () => ok(true)

      Body.appendChild(script)
    })
  }
})()


const Game = (() => {
  let _id = 0,                  // request frame id
      _loads = {},
      _looper = () => l('you spin me right round'),

      _msPassed = 0,
      _lastMs   = 0,
      _points   = 0;

  return {
    points: () => _points,
    zeroth: () => Math.ceil(_lastMs*60/1000)%60 == 0,

    addLoad: (name, loader) => {
      _loads[name] = {
        promise: loader()
          .then(result => {
            l(`${name} loaded`)
            return result;
          })
          .catch(msg => l(`Error: loading ${name}: ${msg}.`)),
        loaded: false
      };
    },
    load: () => Promise.all(Object.keys(_loads).map(k => _loads[k].promise)),

    setLoop: (f) => _looper = f,
    loop: (ms) => {
      _msPassed = ms - _lastMs
      _lastMs = ms
      _id = window.requestAnimationFrame(_looper)
    },

    start: () => Game.loop(),
    stop: () => {
      window.cancelAnimationFrame(_id)
      return _id
    }
  }
})()


var Events = (() => {
  
  window.onkeyup = (e) => {
    switch (e.keyCode) {

    case 27:                      // esc
      l(`stopped game at ${Game.stop()}`)
      break;

    default:
      // l(e.keyCode)
    }
  }

})()
