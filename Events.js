var Events = (() => {

    return {
        load: function() {
            window.onkeyup = (e) => {
                switch (e.keyCode) {

                    case 27: // esc
                        // TODO replace with `l()' whenever
                        console.log(`stopped game at ${Game.stop()}`);
                        break;

                    default:
                        l('Keycode:', e.keyCode);
                }
            };

            return Promise.resolve();
        }
    };
})();
