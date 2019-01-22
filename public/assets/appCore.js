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
        throw err
    })
}

function get(file) {
    return getJSON(HOME + "get/" + file).then(data => {
        if (data.response === 1) {
            if (typeof data.data.js === "undefined")
                return data.data;
            toast("sem conexão", 1500, "toast-warning")
        } else {
            switch (data.response) {
                case 2:
                    toast(data.error, 3000, "toast-warning");
                    break;
                case 3:
                    location.href = data.data;
                    break;
                case 4:
                    toast("Caminho não encontrado", 1500, "toast-warning")
            }
        }
        throw error
    })
}

function clearCache() {
    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
        let clear = [];
        for (var k in dicionarios) {
            clear.push(dbLocal.clear("sync_" + k));
            clear.push(dbLocal.clear(k));
        }

        clear.push(dbLocal.clear('__historic'));
        clear.push(dbLocal.clear('__dicionario'));
        clear.push(dbLocal.clear('__info'));
        clear.push(dbLocal.clear('__allow'));
        clear.push(dbLocal.clear('__general'));
        clear.push(dbLocal.clear('__react'));
        clear.push(dbLocal.clear('__relevant'));
        clear.push(dbLocal.clear('__template'));
        clear.push(dbLocal.clear('__user'));

        return Promise.all(clear);
    }).then(() => {
        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                return caches.delete(cacheName)
            }))
        })
    });
}

function updateCache() {
    let loading_screen = pleaseWait({
        logo: FAVICON,
        backgroundColor: THEME,
        loadingHtml: "<p class='theme-text-aux'>Carregando Recursos</p><div class='spinner'><div class='bounce1' style='background-color: " + THEMETEXT + "'></div><div class='bounce2' style='background-color: " + THEMETEXT + "'></div><div class='bounce3' style='background-color: " + THEMETEXT + "'></div></div>"
    });
    return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations)
            registration.unregister()
    }).then(() => {
        return clearCache().then(() => {
            return get("appFiles").then(g => {
                return caches.open('core-v' + VERSION).then(cache => {
                    return cache.addAll(g.core)
                }).then(() => {
                    return caches.open('fonts-v' + VERSION).then(cache => {
                        return cache.addAll(g.fonts)
                    })
                }).then(() => {
                    return caches.open('images-v' + VERSION).then(cache => {
                        return cache.addAll(g.images)
                    })
                }).then(() => {
                    return caches.open('viewJs-v' + VERSION).then(cache => {
                        return cache.addAll(g.viewJs)
                    })
                }).then(() => {
                    return caches.open('viewCss-v' + VERSION).then(cache => {
                        return cache.addAll(g.viewCss)
                    })
                }).then(() => {
                    return caches.open('view-v' + VERSION).then(cache => {
                        return cache.addAll(g.view)
                    })
                }).then(() => {
                    return caches.open('get-v' + VERSION).then(cache => {
                        return cache.addAll(g.get)
                    })
                }).then(() => {
                    return caches.open('misc-v' + VERSION).then(cache => {
                        return cache.addAll(g.misc)
                    })
                }).then(() => {
                    return caches.open('midia-v' + VERSION).then(cache => {
                        return cache.addAll(g.midia)
                    })
                });
            })
        }).then(() => {
            let gets = [];
            let creates = [];
            gets.push(get("react"));
            gets.push(get("allow"));
            gets.push(get("dicionarios"));
            gets.push(get("info"));
            gets.push(get("relevant"));
            gets.push(get("general"));
            gets.push(get("templates"));
            gets.push(get("user"));

            return Promise.all(gets).then(r => {
                creates.push(dbLocal.exeCreate('__react', r[0]));
                creates.push(dbLocal.exeCreate('__allow', r[1]));
                creates.push(dbLocal.exeCreate('__dicionario', r[2]));
                creates.push(dbLocal.exeCreate('__info', r[3]));
                creates.push(dbLocal.exeCreate('__relevant', r[4]));
                creates.push(dbLocal.exeCreate('__general', r[5]));
                creates.push(dbLocal.exeCreate('__template', r[6]));
                creates.push(dbLocal.exeCreate('__user', r[7]));

                return Promise.all(creates);
            });
        }).then(() => {
            loading_screen.finish()
        })
    })
}

window.onload = function () {
    if (location.href !== HOME + "updateSystem" && location.href !== HOME + "updateSystem/force") {
        caches.open('core-v' + VERSION).then(function (cache) {
            return cache.match(HOME + "assetsPublic/appCore.min.js").then(response => {
                if (!response)
                    return updateCache();
                return response
            })
        }).then(() => {
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