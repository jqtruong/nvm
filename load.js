var Head = document.getElementsByTagName('head')[0];
var Body = document.body;
var DEBUG = false;
var l = (...msgs) => DEBUG && console.log(...msgs);

const SCRIPTS = [
    'Canvas',
    'GL',
    'Matrix',
    'Programs',
    'Frame',
    'Events',
    'Game',
];

window.onload = (ev) => {
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

        json: function(name) {
            return fetch(`/data/${name}.json`)
                .then(response => response.json())
                .catch(e => { throw e; });
        },

        scripts: function (names, callback='load') {
            var redux = names.reduce(
                (acc, name, i) => {
                    return acc.then(result => {
                        if (result) l(`#${i}:`, result);
                        return _appendScript(name, callback);
                    }).catch(e => { throw e; });
                },
                Promise.resolve()
            );

            return redux;
        },
    };

    function _appendScript(name, callback) {
        let filename = `${name}.js`;
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
        return () => {
            argh(JSON.stringify({
                name,
                error: `failed to load ${name}`,
            }));
        };
    }

    function _onScriptLoad(name, ok, argh, callback) {
        return () => {
            if (callback) {
                window[name][callback]()
                    .then(() => ok({ name }))
                    .catch(e => argh(e));
            }
            else {
                ok(JSON.stringify({ name }));
            }
        };
    }

})();
