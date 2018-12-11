function getRequest(url) {
    // Return a new promise.
    return new Promise(function (resolve, reject) {
        // Do the usual XHR stuff
        var req = new XMLHttpRequest();
        req.open('GET', url);

        req.onload = function () {
            // This is called even on 404 etc
            // so check the status
            if (req.status == 200) {
                // Resolve the promise with the response text
                resolve(req.response);
            } else {
                // Otherwise reject with the status text
                // which will hopefully be a meaningful error
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = function () {
            reject(Error("Network Error"));
        };

        // Make the request
        req.send();
    });
}

function getJSON(url) {
    return getRequest(url).then(JSON.parse).catch(function (err) {
        console.log("getJSON failed for", url, err);
        throw err;
    });
}

window.onload = function () {
    var loading_screen = null;
    caches.open('core-v' + VERSION).then(function (cache) {
        return cache.match("assetsPublic/appCore.min.js").then(response => {
            if (!response) {
                loading_screen = pleaseWait({
                    logo: FAVICON,
                    backgroundColor: THEME,
                    loadingHtml: "<p>Carregando Recursos</p><div class='spinner'><div class='bounce1' style='background-color: " + THEMETEXT + "'></div><div class='bounce2' style='background-color: " + THEMETEXT + "'></div><div class='bounce3' style='background-color: " + THEMETEXT + "'></div></div>"
                });

                /** Instala os Services
                 * */
                getJSON(HOME + "get/read/appFiles").then(g => {
                    if (g && g.response === 1 && typeof g.data.content === 'object') {
                        g = g.data.content;
                        console.log(g);
                        return cache.addAll(g.core).then(d => {

                            caches.open('misc-v' + VERSION).then(cache => {
                                return cache.addAll(g.misc);

                            }).then(d => {
                                return caches.open('get-v' + VERSION).then(cache => {
                                    return cache.addAll(g.get);
                                });

                            }).then(d => {
                                return caches.open('view-v' + VERSION).then(cache => {
                                    return cache.addAll(g.view);
                                });

                            }).then(d => {
                                return caches.open('midia-v' + VERSION).then(cache => {
                                    return cache.addAll(g.midia);
                                });

                            });
                        });
                    }
                });
            } else {
                if ('serviceWorker' in navigator)
                    navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION);

                return response;
            }
        });

    }).then(d => {
        let scriptCore = document.createElement('script');
        scriptCore.src = HOME + "assetsPublic/core.min.js";
        document.head.appendChild(scriptCore);

        let styleFont = document.createElement('link');
        styleFont.rel = "stylesheet";
        styleFont.href = HOME + "assetsPublic/fonts.min.css";
        document.head.appendChild(styleFont);

        if (loading_screen)
            loading_screen.finish();
    })
}