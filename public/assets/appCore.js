function getRequest(url) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response)
            } else {
                reject(Error(req.statusText))
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"))
        };
        req.send()
    })
}

function getJSON(url) {
    return getRequest(url).then(JSON.parse).catch(function (err) {
        console.log("getJSON failed for", url, err);
        throw err
    })
}

function clearCache() {
    return caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => {
            return caches.delete(cacheName)
        }))
    })
}

function updateCache() {
    let loading_screen = pleaseWait({
        logo: FAVICON,
        backgroundColor: THEME,
        loadingHtml: "<p class='theme-text-aux'>Carregando Recursos</p><div class='spinner'><div class='bounce1' style='background-color: " + THEMETEXT + "'></div><div class='bounce2' style='background-color: " + THEMETEXT + "'></div><div class='bounce3' style='background-color: " + THEMETEXT + "'></div></div>"
    });

    return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations)
            registration.unregister();

    }).then(d => {
        return clearCache().then(d => {
            return getJSON(HOME + "get/appFiles").then(g => {
                if (g && g.response === 1 && typeof g.data === 'object') {
                    g = g.data;
                    caches.open('core-v' + VERSION).then(cache => {
                        return cache.addAll(g.core)
                    }).then(d => {
                        caches.open('assets-v' + VERSION).then(cache => {
                            return cache.addAll(g.assets)
                        })
                    }).then(d => {
                        caches.open('misc-v' + VERSION).then(cache => {
                            return cache.addAll(g.misc)
                        })
                    }).then(d => {
                        return caches.open('get-v' + VERSION).then(cache => {
                            return cache.addAll(g.get)
                        })
                    }).then(d => {
                        return caches.open('view-v' + VERSION).then(cache => {
                            return cache.addAll(g.view)
                        })
                    }).then(d => {
                        return caches.open('midia-v' + VERSION).then(cache => {
                            return cache.addAll(g.midia)
                        })
                    })
                }
            })
        }).then(d => {
            loading_screen.finish();
        })
    });
}

window.onload = function () {
    if (location.href !== HOME + "updateSystem" && location.href !== HOME + "updateSystem/force") {
        caches.open('core-v' + VERSION).then(function (cache) {
            return cache.match(HOME + "assetsPublic/appCore.min.js").then(response => {
                if (!response)
                    return updateCache();
                return response
            })
        }).then(d => {
            if ('serviceWorker' in navigator)
                navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION);

            let scriptCore = document.createElement('script');
            scriptCore.src = HOME + "assetsPublic/core.min.js";
            document.head.appendChild(scriptCore);
            let styleFont = document.createElement('link');
            styleFont.rel = "stylesheet";
            styleFont.href = HOME + "assetsPublic/fonts.min.css";
            document.head.appendChild(styleFont)
        })
    } else {
        let scriptCore = document.createElement('script');
        scriptCore.src = HOME + "assetsPublic/core.min.js";
        document.head.appendChild(scriptCore);
        clearCache();
    }
}