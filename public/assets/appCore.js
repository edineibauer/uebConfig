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

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

function setCookieAnonimo() {
    setCookie("token", 0);
    setCookie("id", 0);
    setCookie("nome", "Desconhecido");
    setCookie("nome_usuario", "desconhecido");
    setCookie("email", "");
    setCookie("setor", 0);
    setCookie("nivel", 1);
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", HOME + "set", !0);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            if (data.data !== "no-network" && data.response === 1)
                setCookie("update", data.data)
        }
    };
    xhttp.send("lib=config&file=update")
}


function clearCacheLogin() {
    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
        let clear = [];
        for (var k in dicionarios) {
            clear.push(dbLocal.exeRead("sync_" + k).then(d => {
                if(d.length) {
                    return dbRemote.sync(k).then(() => {
                        return dbLocal.clear("sync_" + k)
                    });
                } else {
                    return dbLocal.clear("sync_" + k)
                }
            }));
            clear.push(dbLocal.clear(k))
        }
        clear.push(dbLocal.clear('__historic'));
        clear.push(dbLocal.clear('__dicionario'));
        clear.push(dbLocal.clear('__info'));
        clear.push(dbLocal.clear('__menu'));
        return Promise.all(clear)
    }).then(() => {
        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                let core = new RegExp("^core-v", "i");
                let fonts = new RegExp("^fonts-v", "i");
                let images = new RegExp("^images-v", "i");
                let misc = new RegExp("^misc-v", "i");
                let midia = new RegExp("^midia-v", "i");
                let cache = new RegExp("^cacheimage-v", "i");
                if(!core.test(cacheName) && !fonts.test(cacheName) && !images.test(cacheName) && !misc.test(cacheName) && !midia.test(cacheName) && !cache.test(cacheName))
                    return caches.delete(cacheName);
                else
                    return new Promise();
            }))
        })
    })
}

function updateCacheLogin() {
    let loading_screen = pleaseWait({
        logo: FAVICON,
        backgroundColor: THEME,
        loadingHtml: "<p class='theme-text-aux'>Carregando Recursos</p><div class='spinner'><div class='bounce1' style='background-color: " + THEMETEXT + "'></div><div class='bounce2' style='background-color: " + THEMETEXT + "'></div><div class='bounce3' style='background-color: " + THEMETEXT + "'></div></div>"
    });
    return clearCacheLogin().then(() => {
        return get("appFiles").then(g => {
            return caches.open('viewJs-v' + VERSION).then(cache => {
                return cache.addAll(g.viewJs)
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
            })
        })
    }).then(() => {
        let gets = [];
        let creates = [];
        gets.push(get("dicionarios"));
        gets.push(get("info"));
        gets.push(get("menu"));
        return Promise.all(gets).then(r => {
            creates.push(dbLocal.exeCreate('__dicionario', r[0]));
            creates.push(dbLocal.exeCreate('__info', r[1]));
            creates.push(dbLocal.exeCreate('__menu', r[2]));
            return Promise.all(creates)
        })
    }).then(() => {
        if (getCookie("token") === "" && app.route !== "updateSystem/force" && app.route !== "updateSystem")
            setCookieAnonimo();
        loading_screen.finish()
    })
}

function clearCache() {
    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
        let clear = [];
        for (var k in dicionarios) {
            clear.push(dbLocal.clear("sync_" + k));
            clear.push(dbLocal.clear(k))
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
        clear.push(dbLocal.clear('__menu'));
        return Promise.all(clear)
    }).then(() => {
        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                return caches.delete(cacheName)
            }))
        })
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
                })
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
            gets.push(get("menu"));
            return Promise.all(gets).then(r => {
                creates.push(dbLocal.exeCreate('__react', r[0]));
                creates.push(dbLocal.exeCreate('__allow', r[1]));
                creates.push(dbLocal.exeCreate('__dicionario', r[2]));
                creates.push(dbLocal.exeCreate('__info', r[3]));
                creates.push(dbLocal.exeCreate('__relevant', r[4]));
                creates.push(dbLocal.exeCreate('__general', r[5]));
                creates.push(dbLocal.exeCreate('__template', r[6]));
                creates.push(dbLocal.exeCreate('__user', r[7]));
                creates.push(dbLocal.exeCreate('__menu', r[8]));
                return Promise.all(creates)
            })
        }).then(() => {
            if(getCookie("token") === "" && app.route !== "updateSystem/force" && app.route !== "updateSystem")
                setCookieAnonimo();

            loading_screen.finish()
        })
    })
}

function menuHeader() {
    dbLocal.exeRead("__template", 1).then(tpl => {
        let menu = [];
        if(getCookie("token") === "0") {
            menu.push({href: HOME + 'login', text: 'login'});
        } else {
            menu.push({href: HOME + 'dashboard', text: 'minha conta'});
            menu.push({funcao: 'logoutDashboard', text: 'sair'});
        }
        $("#core-menu-custom").html(Mustache.render(tpl['menu-header'], {menu: menu}));
    })
}

window.onload = function () {
    if (location.href !== HOME + "updateSystem" && location.href !== HOME + "updateSystem/force") {
        caches.open('core-v' + VERSION).then(function (cache) {
            return cache.match(HOME + "assetsPublic/appCore.min.js").then(response => {
                if (!response)
                    return updateCache();
                else
                    menuHeader();

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
        clearCache()
    }
}