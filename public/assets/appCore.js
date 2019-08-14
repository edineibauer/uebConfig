/**
 * Adiciona função para carregar e cachear Scripts
 * */
$.cachedScript = function (url, options) {
    options = $.extend(options || {}, {dataType: "script", cache: !0, url: url});
    return $.ajax(options)
};

function convertEmptyArrayToNull(param) {
    if (typeof (param) === "object" && !$.isEmptyObject(param)) {
        $.each(param, function (key, value) {
            if ($.isArray(value))
                param[key] = value.length > 0 ? value : ""; else if (typeof (value) === "object")
                param[key] = !$.isEmptyObject(param) ? convertEmptyArrayToNull(value) : ""
        })
    }
    return param
}

function post(lib, file, param, funcao) {
    if (typeof funcao === "undefined" && typeof param !== 'object') {
        funcao = param;
        param = {lib: lib, file: file}
    } else {
        param.lib = lib;
        param.file = file
    }
    $.ajax({
        type: "POST", url: HOME + 'set', data: convertEmptyArrayToNull(param), success: function (data) {
            if (data.response === 1) {
                if (typeof (funcao) !== "undefined")
                    funcao(data.data)
            } else {
                switch (data.response) {
                    case 2:
                        toast(data.error, 3000, "toast-warning");
                        break;
                    case 3:
                        location.href = data.data;
                        break;
                    case 4:
                        if(data.data === "no-network")
                            toast("Sem Conexão", 1000, "toast-warning");
                        else
                            toast("Caminho não encontrado", "toast-warning");
                        break
                }

                if (typeof (funcao) !== "undefined")
                    funcao((data.data === "no-network" ? "no-network" : null));
            }
        }, dataType: "json"
    })
}

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

function view(file, funcao) {
    getJSON(HOME + "view/" + file).then(data => {
        if (data.response === 1) {
            funcao(data.data)
        } else {
            switch (data.response) {
                case 2:
                    toast(data.error, 3000, "warning");
                    break;
                case 3:
                    location.href = data.data;
                    break;
                case 4:
                    toast("Caminho não encontrado");
            }

            console.log(data);
            funcao(null);
        }
    });
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.setAttribute('target', '_blank');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element)
}

function CSV(array, comma) {
    // Use first element to choose the keys and the order
    var keys = Object.keys(array[0]);
    comma = (typeof comma === "undefined" ? ";" : comma);

    // Build header
    var result = keys.join(comma) + "\n";

    // Add the rows
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
            if (ix)
                result += comma;

            let v = "";
            if (Array.isArray(obj[k])) {
                $.each(obj[k], function(i, o) {
                    if(v !== "")
                        v += ", ";

                    if(typeof o.url === "string")
                        v += o.url;
                    else if (typeof obj[k] === "object")
                        v += JSON.stringify(obj[k]);
                    else if(typeof o === "string")
                        v += o;

                });
            } else if (typeof obj[k] === "object") {
                v = JSON.stringify(obj[k]);
            } else {
                v = obj[k];
            }

            result += v;
        });
        result += "\n";
    });

    return result;
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

/**
 * Verifica se parâmetro é um JSON object
 * */
function isJson(str) {
    if (typeof str !== "string")
        return false;

    try {
        if (typeof JSON.parse(str) !== "object")
            return false;
    } catch (e) {
        return false;
    }
    return true;
}

function isEmpty(valor) {
    //se o valor for vazio, retorna true
    if(typeof valor === "undefined" || valor === "" || valor === null)
        return true;

    //array vazio
    if($.isArray(valor) && valor.length === 0)
        return true;

    //objeto vazio
    if(typeof valor === "object" && $.isEmptyObject(valor))
        return true;

    return false;
}

/**
 * Notificação Push
 * */
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
    if (typeof icon === 'undefined' && typeof image !== "undefined")
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

function updateVersionNumber() {
    clearInterval(checkUpdateInt);
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", HOME + "set");
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let data = JSON.parse(this.responseText);
            if (data.data !== "no-network" && data.response === 1)
                setCookie("update", data.data);
        }
    };
    xhttp.send("lib=config&file=update");
}

function checkUpdate() {
    return new Promise(function (resolve, r) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                if (data.response === 1 && data.data != getCookie("update")) {
                    clearInterval(checkUpdateInt);
                    toast("<div class='left'>Nova versão</div><button class='right btn btn-small radius-jumbo color-gray-dark' onclick='updateCache()'>atualizar</button>", 15000, "toast-warning");
                }
                resolve(1);
            }
        };
        xhttp.send("lib=config&file=update&update=false");
    });
}

/**
 * Sidebar Functions
 * */
function closeSidebar() {
    $("#core-overlay, #core-sidebar").removeClass("active");
    // toggleIcon($(".core-open-menu").find(".icon"), false);
}

function openSidebar() {
    $("#core-applications").html($("#mySidebar").length ? $("#mySidebar").find(".bar-block").html() : "");
    $("#core-overlay, #core-sidebar").addClass("active");
    // toggleIcon($(".core-open-menu").find(".icon"), true);
}

function toggleSidebar(action = 'toggle') {
    if (action === 'toggle') {
        if ($("#core-sidebar").hasClass("active"))
            closeSidebar();
        else
            openSidebar()
    } else if (action) {
        openSidebar()
    } else {
        closeSidebar()
    }
}

/*function toggleIcon($element, action = 'toggle') {
    if (typeof $element === "string")
        $element = $($element);
    if (typeof ($element.attr("data-after")) !== "undefined"){
        if(action === 'toggle'){
            $element.toggleClass($element.attr("data-before")).toggleClass($element.attr("data-after"))
        } else if (action){
            $element.removeClass($element.attr("data-before")).addClass($element.attr("data-after"))
        } else {
            $element.addClass($element.attr("data-before")).removeClass($element.attr("data-after"))
        }
    }
}*/

function logoutDashboard() {
    if(navigator.onLine) {
        if(confirm("desconectar?"))
            app.loadView(HOME + "logout");
    } else {
        toast("Sem Conexão", 1200);
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
    if (getCookie("setor") !== "" && getCookie("setor") !== "0") {
        btnLoginAside.onclick = function () {
            logoutDashboard()
        };
        btnLoginAside.children[0].innerHTML = "exit_to_app"
    } else {
        btnLoginAside.onclick = function () {
            app.loadView(HOME + "login");
        };
        btnLoginAside.children[0].innerHTML = "person"
    }
}

function spaceHeader() {
    let $header = $("#core-header");
    if ($header.css("position") === "fixed")
        $("#core-content").css("margin-top", ($header.height() + parseInt($header.css("padding-top")) + parseInt($header.css("padding-bottom"))) + "px")
}



function menuBottom(tpl) {
    let menu = [];

    if(!HOMEPAGE)
        menu.push({href: HOME, text: "<i class='material-icons left'>home</i>"});

    if (getCookie("token") !== "" && getCookie("token") !== "0")
        menu.push({href: HOME + 'dashboard', text: "<i class='material-icons left'>dashboard</i>"});

    if (getCookie("setor") === "admin") {
        menu.push({href: HOME + 'UIDev', text: "<i class='material-icons left'>settings</i>"});
        menu.push({href: HOME + 'UIEntidades', text: "<i class='material-icons left'>accessibility_new</i>"});
    }

    let content = "";
    for (let m in menu) {
        if (typeof menu[m].text === "string" && menu[m].text !== "undefined") {
            if (typeof menu[m].href === "undefined" && typeof menu[m].funcao === "string") {
                content += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
            } else {
                content += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
            }
        }
    }
    document.querySelector("#core-menu-custom-bottom").innerHTML = content;
}

function menuHeader() {
    loginBtn();
    sidebarUserInfo();
    spaceHeader();
    return dbLocal.exeRead("__template", 1).then(tpl => {
        menuBottom(tpl);
        let menu = [];
        if (getCookie("token") !== "" && getCookie("token") !== "0") {
            menu.push({href: HOME + 'dashboard', text: "<i class='material-icons left'>dashboard</i>"});

            if (getCookie("setor") === "admin") {
                menu.push({href: HOME + 'UIDev', text: "<i class='material-icons left'>settings</i>"});
                menu.push({href: HOME + 'UIEntidades', text: "<i class='material-icons left'>accessibility_new</i>"});
            }
        }
        let content = "";
        for (let m in menu) {
            if (typeof menu[m].text === "string" && menu[m].text !== "undefined") {
                if (typeof menu[m].href === "undefined" && typeof menu[m].funcao === "string") {
                    content += tpl['menu-header-funcao'].replace("{{funcao}}", menu[m].funcao).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                } else {
                    content += tpl['menu-header-href'].replace("{{href}}", menu[m].href).replace("{{text}}", menu[m].text).replace("{{class}}", "theme-text-aux");
                }
            }
        }
        document.querySelector("#core-menu-custom").innerHTML = content;
    })
}


function clearCacheUser() {
    return dbLocal.exeRead("__dicionario", 1).then(dd => {
        let clear = [];
        for (var k in dd) {
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

        /**
         * Clear View user
         * */
        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                let reg = new RegExp("^view-v");
                if(reg.test(cacheName))
                    return caches.delete(cacheName)
            }))
        });
    })
}

function clearCache() {

    setCookie('update', 0, -1);

    return navigator.serviceWorker.getRegistrations().then(function (registrations) {
        /**
         * Clear Caches and Data
         * */
        for (let registration of registrations)
            registration.unregister();

    }).then(() => {

        return dbLocal.exeRead('__dicionario', 1).then(dicion => {
            let clear = [];
            for (var k in dicion)
                clear.push(dbLocal.clear(k));

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

            return Promise.all(clear);
        }).then(() => {
            return caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => {
                    return caches.delete(cacheName)
                }))
            })
        })
    });
}

function updateCache() {
    if (navigator.onLine) {
        toast("Atualizando Aplicativo", 3000, "toast-success");
        clearCache().then(() => {
            location.reload();
        })
    } else {
        toast("Sem Conexão", 1200);
    }
}

function setCookieAnonimo() {
    return setCookieUser({token: 0, id: 0, nome: 'Anônimo', imagem: '', setor: 0});
}

function setCookieUser(user) {
    if (navigator.onLine) {

        /**
         * Limpa dados de usuário
         * */
        return clearCacheUser().then(() => {

            /**
             * Seta usuário
             * */
            setCookie("token", user.token);
            setCookie("id", user.id);
            setCookie("nome", user.nome);
            setCookie("imagem", user.imagem);
            setCookie("setor", user.setor);

            /**
             * Obtém novos dados de usuário
             * */
            return loadCacheUser();
        });

    } else {
        toast("Sem Conexão", 1200);
    }
}

function checkSessao() {
    /**
     * Verifica integridade
     * */
    if (getCookie("id") === "" || getCookie("token") === "" || getCookie("nome") === "" || getCookie("setor") === "") {
        return setCookieAnonimo();

    } else if (getCookie("token") !== "0") {

        /**
         * Verifica se o token atual é válido
         * */
        return new Promise(function (resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", HOME + "set");
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let data = JSON.parse(this.responseText);

                    /**
                     * Se retorno for 0, então token não validou no back
                     * */
                    if (data.response === 1 && data.data === 0) {
                        toast("Token inválido. Desconectado!", 3000);

                        setCookieAnonimo().then(() => {
                            setTimeout(function () {
                                location.reload(1);
                            },1500);
                        });
                    }

                    resolve(1);
                }
            };
            xhttp.send("lib=route&file=sessao");
        });
    } else {
        return Promise.all([]);
    }
}

function updateCacheUser() {
    return clearCacheUser().then(() => {
        return loadCacheUser();
    })
}

function loadUserViews() {
    return get("appFilesView/" + window.location.pathname).then(g => {
        return caches.open('view-v' + VERSION).then(cache => {
            return cache.addAll(g.view)
        })
    })
}

function loadCacheUser() {
    /**
     * Load User Data content
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
            creates.push(loadUserViews());

            dicionarios = r[1];
            creates.push(downloadEntityData());

            menuHeader();

            return Promise.all(creates)
        })
    } else {
        return Promise.all([]);
    }
}

function firstAccess() {
    localStorage.accesscount = 0;
    return updateCacheUser();
}

function thenAccess() {
    /**
     * Check Data content
     * */
    let gets = [];
    gets.push(dbLocal.exeRead("__allow", 1));
    gets.push(dbLocal.exeRead("__dicionario", 1));
    gets.push(dbLocal.exeRead("__template", 1));
    localStorage.accesscount = parseInt(localStorage.accesscount) + 1;

    return Promise.all(gets).then(r => {
        if (isEmpty(r[2])) {
            return updateCacheUser();
        } else {
            dicionarios = r[1];
            return downloadEntityData();
        }
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

function startCache() {
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
    }).then(() => {
        return new Promise(function (resolve, reject) {
            if (app.route !== "updateSystem") {
                var xhttp = new XMLHttpRequest();
                xhttp.open("POST", HOME + "set");
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        let data = JSON.parse(this.responseText);
                        if (data.data !== "no-network" && data.response === 1)
                            setCookie("update", data.data);
                        resolve(1)
                    }
                };
                xhttp.send("lib=config&file=update")
            } else {
                resolve(1)
            }
        })
    }).then(() => {
        setTimeout(function () {
            finishCache();
        }, 500);
    });
}

function finishCache() {
    caches.open('misc-v' + VERSION).then(function (cache) {
        return cache.match(HOME + "manifest.json").then(response => {
            if (!response) {
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
                        return caches.open('misc-v' + VERSION).then(cache => {
                            return cache.addAll(g.misc)
                        })
                    })
                }).then(() => {
                    let gets = [];
                    let creates = [];
                    gets.push(get("react"));
                    gets.push(get("relevant"));
                    gets.push(get("general"));
                    gets.push(get("user"));
                    gets.push(get("reactOnline"));
                    return Promise.all(gets).then(r => {
                        creates.push(dbLocal.exeCreate('__react', r[0]));
                        creates.push(dbLocal.exeCreate('__relevant', r[1]));
                        creates.push(dbLocal.exeCreate('__general', r[2]));
                        creates.push(dbLocal.exeCreate('__user', r[3]));
                        creates.push(dbLocal.exeCreate('__reactOnline', r[4]));
                        return Promise.all(creates)
                    })
                })
            }
        })
    });
}

var dicionarios;
var swRegistration = null;

/**
 * app global de navegação do app
 * */
var app = {
    route: "",
    loading: !1,
    removeLoading: function () {
        app.loading = !1;
        $("#core-loader").css("display", "none");
        $("#core-content").css("opacity", "1")
    },
    setLoading: function () {
        app.loading = !0;
        $("#core-loader").css("display", "block");
        $("#core-content").css("opacity", "0.7")
    },
    applyView: function (file) {
        return view(file, function (g) {
            if (g) {
                if(app.haveAccessPermission(g.setor, g["!setor"])) {
                    $("#core-style").html(g.css);
                    $("#core-title").text(g.title);
                    $("#core-content").html(g.content);
                    if (g.js.length)
                        $.cachedScript(g.js);
                    app.removeLoading();
                    if (g.font.length) {
                        $.each(g.font, function (i, url) {
                            if (!$("head").find("link[href='" + url + "']").length)
                                $("<link />").attr("href", url).attr("rel", "stylesheet").attr('type', 'text/css').attr('media', 'all').attr("data-assets", "core-assets").appendTo("head")
                        })
                    }
                } else {
                    app.applyView('403');
                }

            } else {
                $("#core-content").html("");
                app.removeLoading()
            }
        })
    },
    haveAccessPermission: function(setor, notSetor) {
        let allow = !0;
        let mySetor = getCookie("setor");
        if(!isEmpty(setor)) {
            allow = !1;
            if(setor.constructor === Array) {
                $.each(setor, function(i, seto) {
                    if(typeof seto === "string" && seto === mySetor) {
                        allow = !0;
                        return !1;
                    }
                });
            } else if(typeof setor === "string" && setor === mySetor) {
                allow = !0;
            }
        } else if(!isEmpty(notSetor)) {
            if(notSetor.constructor === Array) {
                $.each(notSetor, function(i, seto) {
                    if(typeof seto === "string" && seto === mySetor)
                        return allow = !1;
                });
            } else if(typeof notSetor === "string" && notSetor === mySetor) {
                allow = !1;
            }
        }

        return allow;
    },
    loadView: function (route, nav) {
        closeSidebar();
        return new Promise((s, f) => {
            let backform = new RegExp('#formulario$');
            if (backform.test(route)) {
                $(".btn-form-list").trigger("click");
                return s(1)
            } else if((route === HOME + "dashboard" || route === HOME + "dashboard/") && $(".menu-li[data-atributo='panel'][data-action='page'][data-lib='dashboard']").length) {
                $(".menu-li[data-atributo='panel'][data-action='page'][data-lib='dashboard']").trigger("click");
                return s(1);
            } else {
                let haveRoute = typeof route === "string";
                route = haveRoute ? route.replace(HOME, '') : location.href.replace(HOME, '');
                if ((app.route === "" || app.route !== route) && !app.loading) {
                    app.setLoading();
                    if (typeof nav === "undefined" && app.route !== "")
                        history.pushState(null, null, HOME + route);

                    app.route = route || "/";
                    let file = route === HOME || route + "/" === HOME || route === "" || route === "/" ? "index" : route.replace(HOME, "");
                    return s(app.applyView(file))
                } else if (haveRoute && app.route === route){
                    location.reload(1);
                } else {
                    return s(1)
                }
            }
        });
    }
};

var checkUpdateInt = null;
$(function() {
    if (location.href !== HOME + "updateSystem") {

        window.onpopstate = function () {
            app.loadView(document.location.href, !0)
        };

        $("body").off("click", "a").on("click", "a", function (e) {
            let url = $(this).attr("href").replace(HOME, '');
            let p = new RegExp(/^#/i);
            let pjs = new RegExp(/^javascript/i);
            if ($(this).attr("target") !== "_blank" && !p.test(url) && !pjs.test(url)) {
                e.preventDefault();
                app.loadView($(this).attr("href"));
            }
        }).off("submit", "form").on("submit", "form", function (e) {
            e.preventDefault()
        });

        $(".core-open-menu").off("click").on("click", function () {
            toggleSidebar();
        });

        checkSessao().then(() => {
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
            }).then(() => {
                return app.loadView();

            }).then(() => {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION).then(function (swReg) {
                        swRegistration = swReg;

                        /**
                         * Notificação btn
                         * */
                        if (getCookie("token") === "0" || Notification.permission !== "default" || PUSH_PUBLIC_KEY === "")
                            $(".site-btn-push").remove()
                    })
                }

                if(localStorage.accesscount === "0")
                    return startCache();

            }).then(() => {
                checkUpdateInt = setInterval(function () {
                    checkUpdate();
                }, 5000);
            });
        });

    } else {
        let scriptCore = document.createElement('script');
        scriptCore.src = HOME + "assetsPublic/core.min.js";
        document.head.appendChild(scriptCore);

        return clearCache().then(() => {
            setCookieUser({token: 0, id: 0, nome: 'Anônimo', imagem: '', setor: 0});
            return app.loadView();
        })
    }
});