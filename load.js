var Head = document.getElementsByTagName('head')[0];
var Body = document.body;
var DEBUG = false;
var l = (...msgs) => DEBUG && console.log(...msgs);
var e = console.error;
var N = 0;
var V = '';

const SCRIPTS = [
  'Canvas'   ,
  'GL'       ,
  'Matrix'   ,
  'Programs' ,
  'Frame'    ,
  'Events'   ,
  'Game'     ,
];

window.onload = (e) => {
  N = new URLSearchParams(location.search).get('v') || 3; /* it no work with version 1 anymore :( */
  V = `v${N}`;
  DEBUG = !!(new URLSearchParams(location.search).get('d'));
  l('DEBUG is', DEBUG ? 'on' : 'false');

  // Load JS and CSS
  Load.scripts(SCRIPTS)
    .then(() => Load.css('index'))
    .then(() => window['Game'].start())
    .catch(err => l('Game could not start due to', err));
};

var Load = (() => {

  return {
    css: function(name) {
      return new Promise((ok, argh) => {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `${V}/${name}.css`;
        link.onload = () => ok(true);

        Head.appendChild(link);
      })
    },
    scripts: function (names, callback='load') {
      return names.reduce((acc, name, i) => acc.then(result => {
        if (result) l(`#${i}:`, JSON.parse(result));
        return _appendScript(name, callback);
      }), Promise.resolve());
    },
  };

  function _appendScript(name, callback) {
    let filename = `${V}/${name}.js`;
    l('loading script', filename);
    return new Promise((ok, argh) => {
      let script = document.createElement('script');
      script.src = filename;
      script.onload = _onScriptLoad(name, ok, argh, callback);
      script.onerror = _onScriptError(name, argh);
      Body.appendChild(script);
    });
  }

  function _onScriptError(name, argh) {
    return () => argh(JSON.stringify({
      name,
      error: `failed to load ${name}`,
      [name]: window[name],
    }));
  }

  function _onScriptLoad(name, ok, argh, callback) {
    return () => {
      let obj = {
        name,
        [name]: window[name]
      };
      if (!callback) return ok(JSON.stringify(obj));
      window[name][callback]()
        .then(() => ok(JSON.stringify(obj)))
        .catch(error => argh(JSON.stringify({ ...obj, error })));
    };
  }

})();
