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
        toast("Sem Conexão");
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
                    if (data.data !== "no-network")
                        toast("Caminho não encontrado", 1500, "toast-warning")
            }
        }
        throw new TypeError("Request sem conexão e sem cache");
    })
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    exdays = typeof exdays === "undefined" ? 360 : exdays;
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
                if (d.length) {
                    return dbRemote.sync(k).then(() => {
                        return dbLocal.clear("sync_" + k)
                    })
                } else {
                    return dbLocal.clear("sync_" + k)
                }
            }));
            clear.push(dbLocal.clear(k))
        }
        clear.push(dbLocal.clear('__historic'));
        clear.push(dbLocal.clear('__allow'));
        clear.push(dbLocal.clear('__dicionario'));
        clear.push(dbLocal.clear('__info'));
        clear.push(dbLocal.clear('__menu'));
        clear.push(dbLocal.clear('__panel'));
        return Promise.all(clear)
    }).then(() => {
        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                let versionOld = new RegExp("-v" + VERSION + "$", "i");
                if (!versionOld.test(cacheName))
                    return caches.delete(cacheName)
            }))
        })
    })
}

function loadScreen() {
    let $app = document.querySelector("#app");
    let spin = document.createElement("div");
    spin.classList.add("spinner");
    spin.innerHTML = '<div class="double-bounce1" style="background-color: ' + THEMETEXT + '"></div>\n' + '  <div class="double-bounce2" style="background-color: ' + THEMETEXT + '"></div>';
    $app.style.opacity = 0.7;
    $app.appendChild(spin);
}

function updateVersion() {
    return updateCacheLogin().then(() => {
        return new Promise(function (resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", HOME + "set");
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let data = JSON.parse(this.responseText);
                    if (typeof data.data === "string" && data.response === 1)
                        setCookie("update", data.data);
                    location.reload(!0)
                }
            };
            xhttp.send("lib=config&file=update&update=false")
        })
    })
}

function checkUpdate() {
    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.response === 1 && data.data != getCookie("update"))
                    updateVersion();
                else
                    resolve(1);
            }
        };
        xhttp.send("lib=config&file=update&update=false");
    });
}

function updateCacheLogin() {
    if (navigator.onLine) {
        loadScreen();
        return clearCacheLogin().then(() => {
            return get("appView").then(g => {
                return caches.open('view-v' + VERSION).then(cache => {
                    let all = [];
                    for (let i in g.view) {
                        if (typeof g.view[i] === "string") {
                            all.push(cache.delete(g.view[i]).then(() => {
                                return cache.add(g.view[i])
                            }))
                        }
                    }
                    return Promise.all(all)
                })
            })
        }).then(() => {
            let gets = [];
            let creates = [];
            gets.push(get("allow"));
            gets.push(get("dicionarios"));
            gets.push(get("info"));
            gets.push(get("menu"));
            gets.push(get("panel"));
            return Promise.all(gets).then(r => {
                creates.push(dbLocal.exeCreate('__allow', r[0]));
                creates.push(dbLocal.exeCreate('__dicionario', r[1]));
                creates.push(dbLocal.exeCreate('__info', r[2]));
                creates.push(dbLocal.exeCreate('__menu', r[3]));
                creates.push(dbLocal.exeCreate('__panel', r[4]));
                return Promise.all(creates)
            })
        });

    } else {
        toast("Sem Conexão", 1200);
    }
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
        clear.push(dbLocal.clear('__reactOnline'));
        clear.push(dbLocal.clear('__relevant'));
        clear.push(dbLocal.clear('__template'));
        clear.push(dbLocal.clear('__user'));
        clear.push(dbLocal.clear('__menu'));
        clear.push(dbLocal.clear('__panel'));
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
    if (navigator.onLine) {
        loadScreen();
        return navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations)
                registration.unregister()
        }).then(() => {
            return clearCache().then(() => {
                return get("currentFiles/" + window.location.pathname).then(g => {
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
                        return caches.open('midia-v' + VERSION).then(cache => {
                            return cache.addAll(g.midia)
                        })
                    })
                })
            }).then(() => {
                let gets = [];
                let creates = [];
                gets.push(get("allow"));
                gets.push(get("dicionarios"));
                gets.push(get("info"));
                gets.push(get("templates"));
                gets.push(get("menu"));
                gets.push(get("panel"));
                return Promise.all(gets).then(r => {
                    creates.push(dbLocal.exeCreate('__allow', r[0]));
                    creates.push(dbLocal.exeCreate('__dicionario', r[1]));
                    creates.push(dbLocal.exeCreate('__info', r[2]));
                    creates.push(dbLocal.exeCreate('__template', r[3]));
                    creates.push(dbLocal.exeCreate('__menu', r[4]));
                    creates.push(dbLocal.exeCreate('__panel', r[5]));
                    return Promise.all(creates)
                })
            }).then(() => {
                return new Promise(function (resolve, reject) {
                    if (app.route !== "updateSystem/force" && app.route !== "updateSystem") {
                        var xhttp = new XMLHttpRequest();
                        xhttp.open("POST", HOME + "set");
                        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        xhttp.onreadystatechange = function () {
                            if (this.readyState === 4 && this.status === 200) {
                                let data = JSON.parse(this.responseText);
                                if (data.data !== "no-network" && data.response === 1)
                                    setCookie("update", data.data);

                                resolve(1);
                            }
                        };
                        xhttp.send("lib=config&file=update")
                    } else {
                        resolve(1);
                    }
                });
            }).then(() => {
                return checkUpdate();
            }).then(() => {
                return checkSessao()
            }).then(() => {
                window.location.reload(!0)
            })
        })
    } else {
        toast("Sem Conexão", 1200);
    }
}

function setCookieAnonimo() {
    return setCookieUser({token: 0, id: 0, nome: 'Anônimo', imagem: '', setor: 0})
}

function setCookieUser(user) {
    setCookie("token", user.token);
    setCookie("id", user.id);
    setCookie("nome", user.nome);
    setCookie("imagem", user.imagem);
    setCookie("setor", user.setor);
    return updateCacheLogin()
}

function checkSessao() {
    return new Promise(function (resolve, reject) {
        if (getCookie("token") === "") {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", HOME + "set");
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let data = JSON.parse(this.responseText);
                    if (typeof data.data === "object" && data.response === 1) {
                        resolve(setCookieUser(data.data).then(() => {
                            window.location.href = HOME + "dashboard"
                        }));
                    } else {
                        resolve(setCookieAnonimo().then(() => {
                            window.location.href = HOME
                        }));
                    }
                }
            };
            xhttp.send("lib=route&file=sessao");
        } else {
            checkUpdate();
            setSidebarInfo();
            resolve(1);
        }
    });
}

function setSidebarInfo() {
    if (getCookie("token") === "0" || getCookie("imagem") === "") {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<div id='core-sidebar-perfil-img'><i class='material-icons'>people</i></div>"
    } else {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<img src='" + decodeURIComponent(getCookie("imagem")) + "&h=120&w=120' height='80' width='100' id='core-sidebar-perfil-img'>"
    }
    document.querySelector("#core-sidebar-nome").innerHTML = getCookie("nome");
    document.querySelector("#core-sidebar-edit").classList.add("hide")
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function pushNotification(title, body, url, image, icon) {
    if(typeof icon === 'undefined' && typeof image !== "undefined")
        icon = image;

    swRegistration.showNotification(title, {
        body: body || "",
        icon: icon || "",
        badge: image || "",
        data: url || ""
    });
}

function subscribeUser() {
    if (PUSH_PUBLIC_KEY !== "") {
        const applicationServerKey = urlB64ToUint8Array(PUSH_PUBLIC_KEY);
        swRegistration.pushManager.subscribe({
            applicationServerKey: applicationServerKey,
            userVisibleOnly: !0,
        }).then(function (subscription) {
            updateSubscriptionOnServer(subscription);
            $(".site-btn-push").remove()
        }).catch(function (err) {
            toast("Erro ao tentar receber as notificações", 3500, "toast-warning")
        })
    } else {
        toast("Chave pública do Push não definida", 3500, "toast-warning")
    }
}

function updateSubscriptionOnServer(subscription) {
    if (subscription) {
        post('dashboard', 'push', {
            "push": JSON.stringify(subscription),
            'p1': navigator.appName,
            'p2': navigator.appCodeName,
            'p3': navigator.platform
        }, function (g) {
            toast("Agora você esta apto a receber notificações", 3500, "toast-success")
        })
    }
}

function sidebarUserInfo() {
    if (getCookie("token") === "0" || getCookie("imagem") === "") {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<div id='core-sidebar-perfil-img'><i class='material-icons'>people</i></div>"
    } else {
        document.querySelector("#core-sidebar-imagem").innerHTML = "<img src='" + decodeURIComponent(getCookie("imagem")) + "&h=120&w=120' height='80' width='100' id='core-sidebar-perfil-img'>"
    }
    document.querySelector("#core-sidebar-nome").innerHTML = getCookie("nome");
    document.querySelector("#core-sidebar-edit").classList.add("hide")
}

function loginBtn() {
    let btnLoginAside = document.querySelector("#login-aside");
    if (getCookie("setor") !== "0") {
        btnLoginAside.onclick = function () {
            logoutDashboard()
        };
        btnLoginAside.children[0].innerHTML = "exit_to_app"
    } else {
        btnLoginAside.onclick = function () {
            app.loadView(HOME + "login");
            closeSidebar()
        };
        btnLoginAside.children[0].innerHTML = "person"
    }
}

function menuHeader() {

    loginBtn();
    sidebarUserInfo();

    return dbLocal.exeRead("__template", 1).then(tpl => {
        let menu = [];
        if (getCookie("token") !== "0") {
            menu.push({href: HOME + 'dashboard', text: 'painel'});
            menu.push({funcao: 'logoutDashboard', text: 'sair'})
        }

        let content = "";
        let contentSidebar = "";
        for (let m in menu) {
            if (typeof menu[m].text === "string" && menu[m].text !== "undefined") {
                if (typeof menu[m].href === "undefined" && typeof menu[m].funcao === "string") {
                    content += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                    contentSidebar += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text upper")
                } else {
                    content += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                    contentSidebar += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text upper")
                }
            }
        }
        document.querySelector("#core-menu-custom").innerHTML = content;
        document.querySelector("#core-sidebar-menu").innerHTML = contentSidebar;
    });
}

function downloadEntityData() {
    let down = [];
    let historic = {};
    $.each(dicionarios, function (entity, meta) {
        down.push(dbRemote.syncDownload(entity).then(h => {
            if (h !== 0)
                historic[entity] = h
        }))
    });

    return Promise.all(down).then(() => {
        return dbLocal.exeUpdate('__historic', historic, 1)
    })
}

function isJson(str) {
    if (typeof str !== "string")
        return !1;
    try {
        if (typeof JSON.parse(str) !== "object")
            return !1
    } catch (e) {
        return !1
    }
    return !0
}

function isEmpty(valor) {
    if (typeof valor === "undefined" || valor === "" || valor === null)
        return !0;
    if ($.isArray(valor) && valor.length === 0)
        return !0;
    if (typeof valor === "object" && $.isEmptyObject(valor))
        return !0;
    return !1
}

function firstAccess() {
    localStorage.accesscount = 0;

    /**
     * Seta usuário anônimo
     * */
    let user = {token: 0, id: 0, nome: 'Anônimo', imagem: '', setor: 0};
    setCookie("token", user.token);
    setCookie("id", user.id);
    setCookie("nome", user.nome);
    setCookie("imagem", user.imagem);
    setCookie("setor", user.setor);

    return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        /**
         * Clear Caches and Data
         * */
        for (let registration of registrations)
            registration.unregister();

        return clearCache();

    }).then(() => {

        /**
         * Load Data content
         * */
        if (navigator.onLine) {
            let gets = [];
            let creates = [];
            gets.push(get("allow"));
            gets.push(get("dicionarios"));
            gets.push(get("info"));
            gets.push(get("templates"));
            gets.push(get("menu"));
            return Promise.all(gets).then(r => {
                creates.push(dbLocal.exeCreate('__allow', r[0]));
                creates.push(dbLocal.exeCreate('__dicionario', r[1]));
                creates.push(dbLocal.exeCreate('__info', r[2]));
                creates.push(dbLocal.exeCreate('__template', r[3]));
                creates.push(dbLocal.exeCreate('__menu', r[4]));

                dicionarios = r[1];
                creates.push(downloadEntityData());

                return Promise.all(creates)
            })
        } else {
            return 1;
        }
    });
}

function thenAccess() {
    /**
     * Verifica integridade
     * */
    if(getCookie("id") === "" || getCookie("token") === "" || getCookie("nome") === "" || getCookie("setor") === "")
        return firstAccess();

    /**
     * Check Data content
     * */
    let gets = [];
    gets.push(dbLocal.exeRead("__allow", 1));
    gets.push(dbLocal.exeRead("__dicionario", 1));
    gets.push(dbLocal.exeRead("__template", 1));
    return Promise.all(gets).then(r => {
        if(isEmpty(r[0]) || isEmpty(r[1]))
            return firstAccess();

        dicionarios = r[1];
        localStorage.accesscount = parseInt(localStorage.accesscount) + 1;

        return downloadEntityData();
    });
}

var dicionarios;
var swRegistration = null;

window.onload = function () {
    if (location.href !== HOME + "updateSystem" && location.href !== HOME + "updateSystem/force") {
        caches.open('core-v' + VERSION).then(function (cache) {
            return cache.match(HOME + "assetsPublic/appCore.min.js?v=" + VERSION).then(response => {
                if (!response)
                    return firstAccess()
                else
                    return thenAccess()
            })
        }).then(() => {
            menuHeader();

        }).then(() => {
            let scriptCore = document.createElement('script');
            scriptCore.src = HOME + "assetsPublic/core.min.js";
            document.head.appendChild(scriptCore);

            let styleFont = document.createElement('link');
            styleFont.rel = "stylesheet";
            styleFont.href = HOME + "assetsPublic/fonts.min.css";
            document.head.appendChild(styleFont);
        })
    } else {
        let scriptCore = document.createElement('script');
        scriptCore.src = HOME + "assetsPublic/core.min.js";
        document.head.appendChild(scriptCore);
        clearCache()
    }
}