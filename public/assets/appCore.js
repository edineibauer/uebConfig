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

            if (app.route !== "updateSystem/force" && app.route !== "updateSystem") {
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
                xhttp.send("lib=config&file=update");
            }

            return loading_screen.finish()
        })
    })
}

function menuHeader() {
    dbLocal.exeRead("__template", 1).then(tpl => {
        let menu = [];
        if (getCookie("token") === "0") {
            menu.push({href: HOME + 'login', text: 'login'})
        } else {
            menu.push({href: HOME + 'dashboard', text: 'minha conta'});
            menu.push({funcao: 'logoutDashboard', text: 'sair'})
        }
        let content = "";
        let contentSidebar = "";
        for (let m in menu) {
            if (typeof menu[m].text === "string" && menu[m].text !== "undefined") {
                if (typeof menu[m].href === "undefined" && typeof menu[m].funcao === "string") {
                    content += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                    contentSidebar += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text upper");
                } else {
                    content += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                    contentSidebar += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text upper");
                }
            }
        }
        document.querySelector("#core-menu-custom").innerHTML = content
        document.querySelector("#core-sidebar-menu").innerHTML = contentSidebar;
    })

    let logo = document.querySelector("#logo-href");
    logo.href = HOME;
    if(LOGO !== "") {
        logo.innerHTML = "<img src='"+ HOME +"assetsPublic/img/logo.png' alt='logo do site " + TITLE + "' title='"+ TITLE +"' height='39' id='core-header-img'><h1 style='font-size:0'>" + TITLE + "</h1>";
    } else {
        logo.innerHTML = "<img src='"+ HOME +"assetsPublic/img/favicon-48.png' height='35' style='height: 35px' class='core-header-img'><h1 id='core-header-title' class='theme-text-aux'>" + TITLE + "</h1>";
    }

    if(getCookie("token") === "0")
        document.querySelector("#core-header-container").style.maxWidth = "1200px";
}

function setCookieAnonimo() {
    setCookieUser({token: 0, id: 0, nome: 'Desconhecido', nome_usuario: 'desconhecido', email:'', imagem:'', setor:0, nivel:1});
}

function setCookieUser(user) {
    setCookie("token", user['token']);
    setCookie("id", user['id']);
    setCookie("nome", user['nome']);
    setCookie("nome_usuario", user['nome_usuario'] || slug(getCookie("nome")));
    setCookie("email", user['email']);
    setCookie("imagem", user['imagem']);
    setCookie("setor", user['setor']);
    setCookie("nivel", user['nivel']);
}

function checkSessao() {
    if (getCookie("token") === "") {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set", !0);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.data !== "no-network" && typeof data.response === "object") {
                    setCookieUser(g);
                } else {
                    setCookieAnonimo();
                }
            }
        };
        xhttp.send("lib=route&file=sessao");
    }
    setSidebarInfo();
}

function setSidebarInfo() {
    if(getCookie("token") === "0" || getCookie("imagem") === "") {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<div id='core-sidebar-perfil-img'><i class='material-icons'>people</i></div>";
    } else {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<img src='" + decodeURIComponent(getCookie("imagem")) + "&h=120&w=120' height='80' width='100' id='core-sidebar-perfil-img'>";
    }

    document.querySelector("#core-sidebar-nome").innerHTML = getCookie("nome");
    document.querySelector("#core-sidebar-edit").classList.add("hide");
}

window.onload = function () {
    if (location.href !== HOME + "updateSystem" && location.href !== HOME + "updateSystem/force") {
        caches.open('core-v' + VERSION).then(function (cache) {
            return cache.match(HOME + "assetsPublic/appCore.min.js").then(response => {
                if(response) {
                    return caches.open('get-v' + VERSION).then(function (cache) {
                        return cache.match(HOME + "get/network").then(response => {
                            if(!response)
                                return updateCacheLogin()
                        })
                    });
                } else {
                    return updateCache();
                }
            })
        }).then(() => {
            menuHeader();
            if ('serviceWorker' in navigator)
                navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION);
            let scriptCore = document.createElement('script');
            scriptCore.src = HOME + "assetsPublic/core.min.js";
            document.head.appendChild(scriptCore);
            let styleFont = document.createElement('link');
            styleFont.rel = "stylesheet";
            styleFont.href = HOME + "assetsPublic/fonts.min.css";
            document.head.appendChild(styleFont);
        }).then(() => {
            checkSessao();
        })
    } else {
        let scriptCore = document.createElement('script');
        scriptCore.src = HOME + "assetsPublic/core.min.js";
        document.head.appendChild(scriptCore);
        clearCache()
    }
}