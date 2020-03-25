/**
 * Adiciona script na página com cach
 * @param url
 * @param options
 * @returns {*}
 */
$.cachedScript = function (url, options) {
    options = $.extend(options || {}, {dataType: "script", cache: !0, url: url});
    return $.ajax(options)
};

/**
 * Primeiro caractere em caixa alta
 * @param string
 * @returns {string}
 */
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Preenche com 2 zeros a esquerda caso tenha menos que 2 caracteres
 * @param n
 * @returns {string}
 */
function zeroEsquerda(n) {
    return ("00" + n).slice(-2);
}

function mergeObject(a, b) {
    $.extend(true, a, b);
}

/**
 * Padroniza valores nulos em Array
 * @param param
 * @returns {*}
 */
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

/**
 * Remove um valor do array através do nome
 * @param array
 * @param name
 * @returns {*}
 */
function removeItemArray(array, name) {
    if ($.inArray(name, array) > -1)
        array.splice($.inArray(name, array), 1);

    return $.grep(array, function () {
        return !0
    });
}

/**
 * Adicionar um valor ao array em uma posição específica
 * @param array
 * @param item
 * @param index
 */
function pushToArrayIndex(array, item, index) {
    array.splice(index, 1, item);
}

/**
 * troca todas as ocorrências na string
 * @param string
 * @param search
 * @param replacement
 * @returns {void | string}
 */
function replaceAll(target, search, replacement) {
    return target.split(search).join(replacement);
}

/**
 * Ordena array pelo parâmetro order passado
 *
 * @param data
 * @param order
 * @returns {[]}
 */
function orderBy(data, order) {
    let classificacao = [];
    $.each(data, function (i, d) {
        classificacao.push(d)
    });
    classificacao.sort(dynamicSort(order)).reverse();
    $.each(classificacao, function (i, c) {
        classificacao[i].position = i + 1
    });
    return classificacao
}

/**
 * Obtém o número de parametros do objeto
 * @param obj
 * @returns {number}
 */
Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

/**
 * Adiciona funções aos elementos jQuery
 * */
$(function ($) {

    /** Adiciona barra de loading no topo do elemento
     * */
    $.fn.loading = function () {
        this.find(".loading").remove();
        this.prepend('<ul class="loading"><li class="fl-left one"></li><li class="fl-left two"></li><li class="fl-left three"></li></ul>');
        return this
    };

    /** Verifica se existe atributo
     * */
    $.fn.hasAttr = function (name) {
        return typeof (this.attr(name)) !== "undefined"
    };

    /**
     * Renderiza template mustache no elemento
     * @param tpl
     * @param param
     * @param includeTpls
     * @returns {PromiseLike<any> | Promise<any>}
     */
    $.fn.htmlTemplate = function (tpl, param, includeTpls) {
        let $this = this;
        includeTpls = typeof includeTpls === "object" && includeTpls.constructor === Array ? includeTpls : null;
        param = typeof param === "object" && param !== null ? param : {};
        mergeObject(param, {home: HOME, vendor: VENDOR, favicon: FAVICON, logo: LOGO});
        return getTemplates().then(templates => {
            let includes = {};
            for(let i in includeTpls)
                includes[includeTpls[i]] = templates[includeTpls[i]];
            $this.html(Mustache.render(templates[tpl], param, includes));
        });
    };
}(jQuery));

/**
 * trás valor de objeto com uso de string com ponto separando níveis. ex:"pessoa.contato.email"
 * */
function fetchFromObject(obj, prop) {

    if (typeof obj === 'undefined') {
        return false;
    }

    var _index = prop.indexOf('.');
    if (_index > -1) {
        return fetchFromObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    }

    return obj[prop];
}

/**
 * cria níveis de objeto com uso de string pontuada. ex:"pessoa.contato.email"
 * */
function fetchCreateObject(obj, prop) {

    if (typeof obj === 'undefined')
        return false;

    var _index = prop.indexOf('.')
    if (_index > -1) {
        if (typeof obj[prop.substring(0, _index)] !== "object")
            obj[prop.substring(0, _index)] = {};
        return fetchCreateObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    } else {
        if (typeof obj[prop] === "undefined")
            obj[prop] = "";
    }
}

function setUpdateVersion() {
    $.ajax({
        type: "POST", url: HOME + 'set', data: {lib: 'config', file: 'update', update: !0}, success: function (data) {
            if (data.data !== "no-network" && data.response === 1)
                setCookie("update", data.data > 2 ? data.data : 2)
        }, dataType: "json", async: !1
    })
}

function checkUserOptions() {
    $("." + USER.setor + "Show").removeClass("hide");
    $("." + USER.setor + "Hide").addClass("hide");
    $("." + USER.setor + "Allow").removeAttr("disabled");
    $("." + USER.setor + "Disabled").attr("disabled", "disabled");
}

function slug(val, replaceBy) {
    replaceBy = replaceBy || '-';
    var mapaAcentosHex = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g,
    };
    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        val = val.replace(expressaoRegular, letra)
    }
    val = val.toLowerCase();
    val = val.replace(/[^a-z0-9\-]/g, " ");
    val = val.replace(/ {2,}/g, " ");
    val = val.trim();
    return val.replace(/\s/g, replaceBy)
}

function readFile(file) {
    return new Promise((s, f) => {
        if (!file)
            return;

        let reader = new FileReader();
        reader.onload = function (e) {
            s(e.target.result);
        };
        reader.readAsText(file);
    });
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
                        toast(data.error, 7000, "toast-warning");
                        break;
                    case 3:
                        pageTransition(data.data);
                        break;
                    case 4:
                        if (data.data === "no-network")
                            toast("Sem Conexão", 3000, "toast-warning");
                        else
                            toast("Caminho não encontrado", "toast-warning");
                        break
                }

                if (typeof (funcao) !== "undefined")
                    funcao((data.data === "no-network" ? "no-network" : null));
            }
        }, fail: function () {
            toast("Erro na Conexão", 3000, "toast-warning");
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
        url = url.replace(HOME, "");
        let isView = new RegExp("^view\/", "i");
        if(isView.test(url))
            location.reload();
        else
            toast("Sem Conexão!", 7000, "toast-error");
        throw err
    })
}

function get(file, retrying) {
    return getJSON(HOME + "get/" + file).then(data => {
        if (data.response === 1) {
            if (typeof data.data.js === "undefined")
                return data.data;
            toast("sem conexão", 2500, "toast-warning")
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
                        toast("Caminho não encontrado", 6500, "toast-warning")
            }
        }
        if (typeof retrying === "undefined") {
            toast("Comunicação perdida! tentando...", 5000, "toast-warning");
            setTimeout(function () {
                return get(file, 1);
            }, 2000);
        } else {
            toast("Sem Conexão!", 7000, "toast-error");
            console.log("OFFLINE: arquivo '" + file  + "'");
        }
    })
}

function view(file, funcao) {
    return getJSON(HOME + "view/" + file).then(data => {
        if (data.response === 1) {
            clearHeaderScrollPosition();
            return funcao(data.data)
        } else {
            switch (data.response) {
                case 2:
                    toast(data.error, 7000, "warning");
                    break;
                case 3:
                    location.href = data.data;
                    break;
                case 4:
                    toast("Caminho não encontrado");
            }

            console.log(data);
            return funcao(null);
        }
    });
}

function download(filename, text) {
    let element = document.createElement('a');
    let blobData = new Blob(['\ufeff' + text], {type: 'application/vnd.ms-excel'});
    let url = window.URL.createObjectURL(blobData);
    element.setAttribute('href', url);
    element.setAttribute('download', filename);
    element.setAttribute('target', '_blank');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element)
}

function CSV(array, comma) {

    //obtem o nome das colunas com base em todos os registros
    comma = (typeof comma === "undefined" ? ";" : comma);

    //obtem o nome das colunas com base em todos os registros
    let keys = [];
    array.forEach(function (obj) {
        Object.keys(obj).forEach(function (e) {
            if (keys.indexOf(e) === -1)
                keys.push(e);
        })
    });

    let regExp = new RegExp(comma, "g");
    let keyChange = "<:::>";
    var result = keys.join(comma) + "\n";

    // Add the rows
    array.forEach(function (obj) {
        keys.forEach(function (k, ix) {
            if (ix)
                result += comma;

            let v = "";

            /*if (Array.isArray(obj[k])) {
                v = "[";
                $.each(obj[k], function (i, o) {
                    if (v !== "" && v !== "[")
                        v += ", ";
                    if (typeof o.url === "string")
                        v += o.url.replace(regExp, keyChange);
                    else if (typeof o === "object" && o !== null)
                        v += JSON.stringify(o).replace(regExp, keyChange);
                    else if (typeof o === "string")
                        v += o.replace(regExp, keyChange)
                });
                v += "]";
            } else */

            if (typeof obj[k] === "object" && obj[k] !== null) {
                v = JSON.stringify(obj[k]).replace(regExp, keyChange);
            } else if (typeof obj[k] !== "undefined" && obj[k] !== null) {
                v = obj[k];
            }

            result += v;
        });
        result += "\n";
    });

    return result;
}

function openKeyboradSimulate() {
    if(window.innerWidth < 900 && DEV) {
        $("html").css("transform", "translateY(-45%)");
        $("#app").append("<div id='keyboard-simulate'>simulação de teclado abrindo.<br>A simulação só acontece enquanto estiver em Desenvolvimento.</div>");
        $("input").one("blur", function () {
            setTimeout(function () {
                $("#keyboard-simulate").remove();
                $("html").css("transform", "translateY(0)");
            }, 200);
        })
    }
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
    if (typeof valor === "undefined" || valor === "" || valor === null)
        return true;

    //array vazio
    if ($.isArray(valor) && valor.length === 0)
        return true;

    //objeto vazio
    if (typeof valor === "object" && $.isEmptyObject(valor))
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

function pushNotification(title, body, url, image, background) {
    swRegistration.showNotification(title, {
        body: body || "",
        data: url || "",
        icon: image || "",
        image: background || "",
        badge: HOME + FAVICON
    });
}

function subscribeUser(showMessageSuccess) {
    if (PUSH_PUBLIC_KEY !== "") {
        showMessageSuccess = typeof showMessageSuccess === "undefined" || !["false", "0", 0, false].indexOf(showMessageSuccess) > -1;
        const applicationServerKey = urlB64ToUint8Array(PUSH_PUBLIC_KEY);
        swRegistration.pushManager.subscribe({
            applicationServerKey: applicationServerKey,
            userVisibleOnly: !0,
        }).then(function (subscription) {
            updateSubscriptionOnServer(subscription, showMessageSuccess);
            $(".site-btn-push").remove()
        }).catch(function (err) {
            toast("Erro ao tentar receber as notificações", 7500, "toast-warning")
        })
    } else {
        toast("Chave pública do Push não definida", 7500, "toast-warning")
    }
}

function updateSubscriptionOnServer(subscription, showMessageSuccess) {
    if (subscription && USER.setor !== 0 && typeof USER.setor === "string" && USER.setor !== "0" && !isEmpty(USER.setor)) {
        post('dashboard', 'push', {
            "push": JSON.stringify(subscription),
            'p1': navigator.appName,
            'p2': navigator.appCodeName,
            'p3': navigator.platform
        }, function () {
            if (!showMessageSuccess)
                pushNotification("Parabéns " + USER.nome, "A partir de agora, você receberá notificações importantes!");
        })
    }
}

function updateVersionNumber() {
    if (!navigator.onLine)
        return Promise.all([]);

    return new Promise(function (resolve, r) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let data = JSON.parse(this.responseText);
                    if (data.data !== "no-network" && data.response === 1 && (getCookie("update") === "" || data.data !== getCookie("update")))
                        setCookie("update", data.data > 2 ? data.data : 2);
                    resolve(1);
                } else {
                    resolve(0);
                }
            }
        };
        xhttp.onerror = function () {
            resolve(0)
        };
        xhttp.send("lib=config&file=update");
    });
}

function checkUpdate() {
    if (!navigator.onLine)
        return Promise.all([]);

    return new Promise(function (resolve, r) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState) {
                if (this.status !== 200 || isEmpty(this.responseText)) {
                    resolve(0);
                } else {

                    let data = JSON.parse(this.responseText);
                    if (data.response === 1 && getCookie("update") !== "" && data.data != getCookie("update"))
                        toast("<div class='left'>Nova versão</div><button style='float: right;border: none;outline: none;box-shadow: none;padding: 10px 20px;border-radius: 50px;margin: -5px -11px -5px 20px;background: #fff;color: #555;cursor: pointer;' onclick='updateCache()'>atualizar</button>", 15000, "toast-success");

                    resolve(1);
                }
            }
        };
        xhttp.onerror = function () {
            resolve(0)
        };
        xhttp.send("lib=config&file=update&update=false");
    });
}

/**
 * Sidebar Functions
 * */
function closeSidebar() {
    $("#app").off("mouseup");
    $("#core-sidebar, #core-overlay").removeClass("active");
    if (window.innerWidth > 899)
        $("#core-sidebar").css("top", ($("#core-header")[0].clientHeight - 50) + "px");

    setTimeout(function () {
        $("#core-sidebar").addClass("hide")
    }, 150);
}

function openSidebar() {
    let $sidebar = $("#core-sidebar").removeClass("hide");
    if (window.innerWidth > 899) {
        $sidebar.css("top", $("#core-header")[0].clientHeight + "px").addClass("active");
    } else {
        $("#core-overlay").addClass("active");
        $sidebar.css("top", 0);
        setTimeout(function () {
            $sidebar.addClass("active");
        }, 50);
    }
    $("#app").on("mouseup", function (e) {
        if (!$sidebar.is(e.target) && $sidebar.has(e.target).length === 0)
            closeSidebar()
    })
}

function toggleSidebar(action = 'toggle') {
    if (action === 'toggle') {
        if ($("#core-sidebar").hasClass("hide"))
            openSidebar();
    } else if (action) {
        openSidebar()
    } else {
        closeSidebar()
    }
}

function logoutDashboard() {
    if (navigator.onLine) {
        toast("Saindo...", 12500);
        setCookieAnonimo().then(() => {
            location.href = HOME + "login";
        })
    } else {
        toast("Sem Conexão", 1200)
    }
}

/**
 * Ajusta os dados do Header, navbar, menu, sidebar, btn login, btn push
 * verifica visibilidade destes itens
 */
function menuHeader() {
    let requests = [];
    requests.push(getTemplates());
    requests.push(dbLocal.exeRead("__menu", 1));
    requests.push(dbLocal.exeRead("__navbar", 1));

    return Promise.all(requests).then(r => {
        let tpl = r[0];
        let menu = (typeof r[1] !== "object" || r[1].constructor !== Array || r[1] === null ? [] : r[1]);
        let navbar = (typeof r[2] !== "object" || r[2].constructor !== Array || r[2] === null ? [] : r[2]);

        $("#core-header").html(Mustache.render(tpl.header, {
            version: VERSION,
            sitename: SITENAME,
            title: TITLE,
            home: HOME,
            homepage: (HOMEPAGE ? "dashboard" : "")
        }));

        let $menuCustom = $("#core-menu-custom");
        if ($menuCustom.length) {
            $menuCustom.html("");
            for (let m in menu) {
                if (typeof menu[m].html === "string" && menu[m].html !== "undefined" && !isEmpty(menu[m].html))
                    $menuCustom.append(Mustache.render(tpl['menu-header'], menu[m]));
            }
        }

        let $headerPerfil = $("#core-header-perfil");
        if ($headerPerfil.length) {
            let src = (typeof USER.imagem === "string" && USER.imagem !== "null" && !isEmpty(USER.imagem) ? (isJson(USER.imagem) ? decodeURIComponent(JSON.parse(USER.imagem)[0]['urls'][100]) : USER.imagem) : "");
            $headerPerfil.html(src !== "" ? "<img src='" + src + "' style='border-radius: 50%; height: 30px;width: 30px;margin: 4px;' width='30' height='30' />" : "<i class='material-icons theme-text-aux' style='padding:8px'>perm_identity</i>");
        }

        let $menuNav = $("#core-header-nav-bottom");
        if ($menuNav.length) {
            let $menu = $("#core-menu-custom-bottom").html("");

            for (let m in navbar) {
                if (typeof navbar[m].html === "string" && navbar[m].html !== "undefined" && !isEmpty(navbar[m].html))
                    $menu.append(Mustache.render(tpl['menu-header'], navbar[m]));
            }

            if ((HOMEPAGE === "0" && navbar.length === 1) || (HOMEPAGE !== "0" && navbar.length === 0)) {
                $menuNav.removeClass('s-show');
            } else {
                $menuNav.addClass('s-show');
                $menu.find("li").css("width", (100 / $menu.find("li").length) + "%")
            }
        }

        $("#core-sidebar").css("right", ((window.innerWidth - $("#core-header-container")[0].clientWidth) / 2) + "px").html(Mustache.render(tpl.aside));

        /**
         * Sidebar Info
         */
        if ($("#core-sidebar-imagem").length) {
            if (getCookie("token") === "0" || isEmpty(USER.imagem) || USER.imagem === "null" || typeof USER.imagem !== "string") {
                document.querySelector("#core-sidebar-imagem").innerHTML = "<div id='core-sidebar-perfil-img'><i class='material-icons'>people</i></div>"
            } else {
                let src = (isJson(USER.imagem) ? decodeURIComponent(JSON.parse(USER.imagem)[0]['urls'][100]) : USER.imagem);
                document.querySelector("#core-sidebar-imagem").innerHTML = "<img src='" + src + "' height='80' width='100' id='core-sidebar-perfil-img'>"
            }
        }

        if ($("#core-sidebar-nome").length)
            document.querySelector("#core-sidebar-nome").innerHTML = getCookie("token") === "0" ? "minha conta" : USER.nome;

        /**
         * Botão de login
         */
        if ($("#login-aside").length) {
            let btnLoginAside = document.querySelector("#login-aside");
            if (typeof USER.setor !== "undefined" && USER.setor !== 0 && USER.setor !== "") {
                btnLoginAside.onclick = function () {
                    logoutDashboard()
                };
                btnLoginAside.children[0].innerHTML = "sair";
                btnLoginAside.children[1].innerHTML = "exit_to_app";
            } else {
                btnLoginAside.onclick = function () {
                    pageTransition("login", "route", "forward", "#core-content", null, null, !1)
                };
                btnLoginAside.children[0].innerHTML = "login";
                btnLoginAside.children[1].innerHTML = "lock_open";
            }
        }

        /**
         * Verifica se remove o botão de Notificação
         * */
        if (getCookie("token") === "0" || Notification.permission !== "default" || PUSH_PUBLIC_KEY === "")
            $(".site-btn-push").remove();

        /**
         * Edição do perfil somente usuários logados
         */
        if ($("#core-sidebar-edit").length) {
            if (USER.setor.toString() !== "0")
                $("#core-sidebar-edit").css("display", "block");
        }
    });
}

function loadSyncNotSaved() {
    return new Promise((resolve, f) => {
        $.ajax({
            type: "GET",
            url: HOME + 'get/load/sync',
            success: function (data) {
                if (data.response === 1) {
                    let sync = data.data;
                    if (typeof sync === "object") {
                        $.each(sync, function (entity, registros) {
                            dbLocal.newKey(entity).then(key => {
                                $.each(registros, function (i, reg) {
                                    let d = Object.assign({}, reg);
                                    d.id = key++;
                                    delete d.id_old;
                                    delete d.db_error;
                                    delete d.db_errorback;
                                    dbLocal.insert(entity, d, d.id);
                                    dbLocal.insert("sync_" + entity, d, d.id);
                                });
                            })
                        });
                    }
                }
                resolve(0)
            },
            error: function () {
                resolve(0)
            },
            dataType: "json"
        })
    });
}

function clearCacheUser() {
    let clear = [];

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    for (let entity in dicionarios) {
        clear.push(dbLocal.exeRead("sync_" + entity).then(d => {
            if (!d.length)
                return;

            post("entity", "up/sync", {entity: entity, dados: d});
            return dbLocal.clear("sync_" + entity)
        }).then(() => {
            return dbLocal.clear(entity);
        }));
    }

    /**
     * Limpa cache information
     */
    clear.push(dbLocal.clear('__historic'));
    clear.push(dbLocal.clear('__allow'));
    clear.push(dbLocal.clear('__dicionario'));
    clear.push(dbLocal.clear('__info'));
    clear.push(dbLocal.clear('__menu'));
    clear.push(dbLocal.clear('__templateUser'));
    clear.push(dbLocal.clear('__graficos'));
    clear.push(dbLocal.clear('__navbar'));
    clear.push(dbLocal.clear('__panel'));

    return Promise.all(clear).then(() => {
        if (SERVICEWORKER) {

            /**
             * Clear cache pages
             */
            return caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => {
                    let corte = cacheName.split("-v");
                    if (corte[1] !== VERSION || ["viewUser", "viewUserCss", "viewUserJs", "viewUserImages", "viewUserGet"].indexOf(corte[0]) > -1)
                        return caches.delete(cacheName);
                }))
            })
        }
    })
}

function clearCacheAll() {
    setCookie('update', 0, -1);
    setCookie('accesscount', "", -1);

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    let clear = [];
    for (let entity in dicionarios) {
        clear.push(dbLocal.exeRead("sync_" + entity).then(d => {
            if (!d.length)
                return;

            post("entity", "up/sync", {entity: entity, dados: d});
            return dbLocal.clear("sync_" + entity)
        }).then(() => {
            return dbLocal.clear(entity);
        }));
    }

    clear.push(dbLocal.clear('__historic'));
    clear.push(dbLocal.clear('__dicionario'));
    clear.push(dbLocal.clear('__info'));
    clear.push(dbLocal.clear('__allow'));
    clear.push(dbLocal.clear('__general'));
    clear.push(dbLocal.clear('__react'));
    clear.push(dbLocal.clear('__relevant'));
    clear.push(dbLocal.clear('__template'));
    clear.push(dbLocal.clear('__templateUser'));
    clear.push(dbLocal.clear('__user'));
    clear.push(dbLocal.clear('__menu'));
    clear.push(dbLocal.clear('__graficos'));
    clear.push(dbLocal.clear('__navbar'));
    clear.push(dbLocal.clear('__panel'));

    return Promise.all(clear).then(() => {
        if (!SERVICEWORKER)
            return Promise.all([]);

        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                return caches.delete(cacheName);
            }))
        });
    }).then(() => {
        return navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations)
                registration.unregister();
        });
    })
}

function updateCache() {
    if (navigator.onLine) {
        toast("Atualizando Aplicativo", 7000, "toast-success");
        clearCacheAll().then(() => {
            updateVersionNumber().then(() => {
                location.reload();
            });
        })
    } else {
        toast("Sem Conexão", 1200);
    }
}

function recoveryUser() {
    return dbLocal.exeRead("__login", 1).then(login => {
        login.id = login.idUserReal;
        delete login.idUserReal;

        USER = login;

        if (getCookie("accesscount") === "")
            return loadCacheUser();
    });
}

function setUserInNavigator(user) {
    user = typeof user === "object" ? user : {
        token: 0,
        id: 0,
        nome: 'Anônimo',
        imagem: '',
        status: 1,
        setor: 0,
        setorData: ""
    };

    USER = user;
    let userLogin = Object.assign({}, USER);
    userLogin.idUserReal = USER.id;
    userLogin.id = 1;

    setCookie("token", user.token);

    return dbLocal.exeCreate("__login", userLogin).then(() => {
        if (getCookie("accesscount") === "")
            return loadCacheUser();
    });
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
            return setUserInNavigator(user).then(() => {

                /**
                 * Obtém novos dados de usuário
                 * */
                if (getCookie("accesscount") !== "")
                    return loadCacheUser();
            });
        });

    } else {
        toast("Sem Conexão", 1200);
    }
}

function checkSessao() {
    /**
     * Verifica Sessão
     * */
    if (getCookie("token") === "") {
        /**
         * Ainda não existe sessão, começa como anônimo
         */
        return setCookieAnonimo().then(() => {
            if (getCookie("accesscount") === "")
                return loadCacheUser();
        });

    } else if (!navigator.onLine) {
        /**
         * Sem internet
         */
        return recoveryUser();

    } else if (navigator.onLine && getCookie("token") !== "0") {

        /**
         * Sessão existe
         * Verifica se o token atual corresponde
         * */
        return new Promise(function (resolve, reject) {
            var xhttp = new XMLHttpRequest();
            xhttp.open("POST", HOME + "set");
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    let data = JSON.parse(this.responseText);

                    /**
                     * Se o request não funcionar
                     */
                    if (this.status !== 200 || isEmpty(this.responseText) || data.response !== 1) {
                        resolve(setUserInNavigator());

                    } else if (data.response === 1) {
                        if (data.data === 0) {
                            toast("Sessão expirada! Desconectando...", 3000);
                            resolve(setCookieAnonimo().then(() => {
                                location.reload();
                            }))
                        } else if (data.data !== 2) {
                            /**
                             * Atualiza variável do usuário
                             */
                            resolve(setUserInNavigator(data.data))
                        } else {
                            resolve(recoveryUser());
                        }
                    }
                }
            };
            xhttp.onerror = function () {
                resolve(0)
            };
            xhttp.send("lib=route&file=sessao");
        });
    } else {
        return setUserInNavigator();
    }
}

/**
 * Atualiza o cache do usuário atual e recarrega
 * @returns {Promise<void>}
 */
function updateAppUser() {
    toast("Atualizando...", 10000, "toast-success");
    updateCacheUser().then(() => {
        location.reload();
    })
}

/**
 * Atualiza o cache do usuário atual
 * @returns {Promise<void>}
 */
function updateCacheUser() {
    if (navigator.onLine) {
        return clearCacheUser().then(() => {
            return loadCacheUser();
        });
    }
}

function loadViews() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    return get("appFilesView/").then(g => {
        return caches.open('view-v' + VERSION).then(cache => {

            /**
             * Cache views
             */
            return cache.addAll(g.view.map(s => "view/" + s));

        }).then(() => {

            /**
             * Para cada view, carrega seus assets
             */
            let viewsAssets = [];
            for (let i in g.view) {
                let viewName = "assetsPublic/view/" + g.view[i];
                viewsAssets.push(viewName + ".min.js?v=" + VERSION);
            }

            /**
             * Cache view Assets
             */
            return caches.open('viewJs-v' + VERSION).then(cache => {
                return cache.addAll(viewsAssets);
            });
        })
    });
}

function loadUserViews() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    return get("appFilesViewUser").then(g => {
        return caches.open('viewUser-v' + VERSION).then(cache => {

            /**
             * Cache views
             */
            return cache.addAll(g.view.map(s => "view/" + s));

        }).then(() => {

            /**
             * Para cada view, carrega seus assets
             */
            let viewsAssets = [];
            for (let i in g.view) {
                let viewName = "assetsPublic/view/" + g.view[i];
                viewsAssets.push(viewName + ".min.js?v=" + VERSION);
            }

            /**
             * Cache view Assets
             */
            return caches.open('viewUserJs-v' + VERSION).then(cache => {
                return cache.addAll(viewsAssets);
            });
        })
    });
}

function loadCacheUser() {
    /**
     * Load User Data content
     * */
    if (navigator.onLine) {

        if (USER.setor !== "0" && app.file === "login")
            toast("Seja Bem Vindo " + USER.nome, 2000, "toast-success");

        let gets = [];
        let creates = [];
        gets.push(get("allow"));
        gets.push(get("dicionarios"));
        gets.push(get("info"));
        gets.push(get("templatesUser"));
        gets.push(get("menu"));
        gets.push(get("navbar"));
        gets.push(get("react"));
        gets.push(get("user"));
        gets.push(get("graficos"));

        /**
         * Adiciona o core Js e core Css do meu atual usuário
         */
        if (SERVICEWORKER) {
            gets.push(caches.open('core-v' + VERSION).then(cache => {
                return cache.addAll([HOME + "assetsPublic/core/" + USER.setor + "/core.min.js?v=" + VERSION, HOME + "assetsPublic/core/" + USER.setor + "/core.min.css?v=" + VERSION]);
            }));
        }

        return Promise.all(gets).then(r => {
            creates.push(dbLocal.exeCreate('__allow', r[0]));
            creates.push(dbLocal.exeCreate('__dicionario', r[1]));
            creates.push(dbLocal.exeCreate('__info', r[2]));
            creates.push(dbLocal.exeCreate('__templateUser', r[3]));
            creates.push(dbLocal.exeCreate('__menu', r[4]));
            creates.push(dbLocal.exeCreate('__navbar', r[5]));
            creates.push(dbLocal.exeCreate('__react', r[6]));
            creates.push(dbLocal.exeCreate('__user', r[7]));
            creates.push(dbLocal.exeCreate('__graficos', r[8]));
            dicionarios = r[1];
            return Promise.all(creates);

        }).then(() => {
            /**
             * Baixa os dados das entidades para este usuário
             */
            return downloadEntityData();

        }).then(() => {
            /**
             * Seta a versão do app
             */
            return setVersionApplication();

        }).then(() => {
            /**
             * Carrega as views para este usuário
             */
            return loadUserViews();
        });

    } else {
        toast("Sem Conexão!", 3000, "toast-warning");
        return Promise.all([])
    }
}

function updateGraficos() {
    return dbLocal.clear('__graficos').then(() => {
        return get("graficos").then(r => {
            return dbLocal.exeCreate('__graficos', r);
        });
    });
}

function getGraficos() {
    return dbLocal.exeRead("__graficos", 1);
}

function getTemplates() {
    return dbLocal.exeRead("__templateUser", 1).then(tplUser => {
        return dbLocal.exeRead("__template", 1).then(tpl => {
            mergeObject(tpl, tplUser);
            return tpl;
        })
    });
}

function errorLoadingApp() {
    toast("Erro ao carregar Aplicativo", 3000, "toast-warning");
    setTimeout(function () {
        updateCache();
    }, 3000);
}

function setVersionApplication() {
    if (getCookie("update") !== "")
        return Promise.all([]);

    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", HOME + "set");
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status !== 200 || isEmpty(this.responseText)) {
                    resolve(0);
                } else {
                    let data = JSON.parse(this.responseText);
                    if (data.data !== "no-network" && data.response === 1)
                        setCookie("update", data.data > 2 ? data.data : 2);

                    resolve(1);
                }
            }
        };
        xhttp.onerror = function () {
            reject(Error("Network Error"))
        };
        xhttp.send("lib=config&file=update")
    })
}

function firstAccess() {
    setCookie('accesscount', 1);

    let gets = [];
    gets.push(get("relevant"));
    gets.push(get("general"));
    gets.push(get("templates"));

    return Promise.all(gets).then(r => {
        let creates = [];
        creates.push(dbLocal.exeCreate('__relevant', r[0]));
        creates.push(dbLocal.exeCreate('__general', r[1]));
        creates.push(dbLocal.exeCreate('__template', r[2]));
        return Promise.all(creates);

    }).then(() => {
        if (!SERVICEWORKER)
            return Promise.all([]);

        return get("currentFiles").then(g => {
            if (!g)
                return Promise.all([]);

            return caches.open('core-v' + VERSION).then(cache => {
                return cache.addAll(g.core).catch(() => {
                    errorLoadingApp();
                })
            }).then(() => {
                return caches.open('fonts-v' + VERSION).then(cache => {
                    return cache.addAll(g.fonts).catch(() => {
                        errorLoadingApp();
                    })
                })
            }).then(() => {
                return caches.open('images-v' + VERSION).then(cache => {
                    return cache.addAll(g.images).catch(() => {
                        errorLoadingApp();
                    })
                })
            }).then(() => {
                return caches.open('misc-v' + VERSION).then(cache => {
                    return cache.addAll(g.misc).catch(() => {
                        errorLoadingApp();
                    })
                })
            });

        }).then(() => {

            /**
             * Check support to webp images
             * */
            async function WebpIsSupported() {
                // If the browser doesn't has the method createImageBitmap, you can't display webp format
                if (!self.createImageBitmap) return !1;

                // Base64 representation of a white point image
                const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';

                // Retrieve the Image in Blob Format
                const blob = await fetch(webpData).then(r => r.blob());

                // If the createImageBitmap method succeeds, return true, otherwise false
                return createImageBitmap(blob).then(() => !0, () => !1);
            }

            (async () => {
                setCookie("webp", await WebpIsSupported());
            })();

        }).then(() => {
            return loadViews();

        });
    });
}

/**
 * Se estiver em Dev, atualiza dados
 */
function updateAppOnDev() {
    if (!navigator.onLine || !DEV)
        return Promise.all([]);

    /**
     * Limpa cache information
     */
    let clear = [];
    clear.push(dbLocal.clear('__allow'));
    clear.push(dbLocal.clear('__dicionario'));
    clear.push(dbLocal.clear('__info'));
    clear.push(dbLocal.clear('__menu'));
    clear.push(dbLocal.clear('__template'));
    clear.push(dbLocal.clear('__templateUser'));
    clear.push(dbLocal.clear('__graficos'));
    clear.push(dbLocal.clear('__navbar'));
    clear.push(dbLocal.clear('__panel'));

    return Promise.all(clear).then(() => {
        if (SERVICEWORKER) {

            /**
             * Clear cache pages
             */
            return caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => {
                    return caches.delete(cacheName);
                }))
            })
        }
    }).then(() => {

        clear = [];
        for (let entity in dicionarios)
            clear.push(dbLocal.clear(entity));

        return Promise.all(clear);

    }).then(() => {

        return get("currentFiles").then(g => {
            if (!g)
                return Promise.all([]);
            return caches.open('core-v' + VERSION).then(cache => {
                return cache.addAll(g.core).catch(() => {
                    errorLoadingApp()
                })
            }).then(() => {
                return caches.open('fonts-v' + VERSION).then(cache => {
                    return cache.addAll(g.fonts).catch(() => {
                        errorLoadingApp()
                    })
                })
            }).then(() => {
                return caches.open('images-v' + VERSION).then(cache => {
                    return cache.addAll(g.images).catch(() => {
                        errorLoadingApp()
                    })
                })
            }).then(() => {
                return caches.open('misc-v' + VERSION).then(cache => {
                    return cache.addAll(g.misc).catch(() => {
                        errorLoadingApp()
                    })
                })
            });

        }).then(() => {
            return loadViews()
        });

    }).then(() => {

        let gets = [];
        let creates = [];
        gets.push(get("allow"));
        gets.push(get("dicionarios"));
        gets.push(get("info"));
        gets.push(get("templates"));
        gets.push(get("templatesUser"));
        gets.push(get("menu"));
        gets.push(get("navbar"));
        gets.push(get("react"));
        gets.push(get("user"));
        gets.push(get("graficos"));

        /**
         * Adiciona o core Js e core Css do meu atual usuário
         */
        if (SERVICEWORKER) {
            gets.push(caches.open('core-v' + VERSION).then(cache => {
                return cache.addAll([HOME + "assetsPublic/core/" + USER.setor + "/core.min.js?v=" + VERSION, HOME + "assetsPublic/core/" + USER.setor + "/core.min.css?v=" + VERSION]);
            }));
        }

        return Promise.all(gets).then(r => {
            creates.push(dbLocal.exeCreate('__allow', r[0]));
            creates.push(dbLocal.exeCreate('__dicionario', r[1]));
            creates.push(dbLocal.exeCreate('__info', r[2]));
            creates.push(dbLocal.exeCreate('__template', r[3]));
            creates.push(dbLocal.exeCreate('__templateUser', r[4]));
            creates.push(dbLocal.exeCreate('__menu', r[5]));
            creates.push(dbLocal.exeCreate('__navbar', r[6]));
            creates.push(dbLocal.exeCreate('__react', r[7]));
            creates.push(dbLocal.exeCreate('__user', r[8]));
            creates.push(dbLocal.exeCreate('__graficos', r[9]));
            dicionarios = r[1];
            return Promise.all(creates);

        }).then(() => {
            /**
             * Baixa os dados das entidades para este usuário
             */
            return downloadEntityData();

        }).then(() => {
            /**
             * Carrega as views para este usuário
             */
            return loadUserViews();
        });
    });
}

function thenAccess() {
    /**
     * Conta acesso
     */
    setCookie('accesscount', (parseInt(getCookie('accesscount')) + 1));

    return updateAppOnDev().then(() => {
        if (!navigator.onLine || !DEV) {
            return dbLocal.exeRead("__dicionario", 1).then(d => {
                dicionarios = d;
            });
        }
    });
}

function downloadEntityData() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    let down = [];
    $.each(dicionarios, function (entity, meta) {
        down.push(dbRemote.syncDownload(entity));
    });

    down.push(loadSyncNotSaved());

    return Promise.all(down);
}

function webp(extension) {
    return (getCookie('webp') === "true" ? 'webp' : extension);
}

function updateTemplates() {
    return get("templates").then(tpl => {
        return dbLocal.exeCreate('__template', tpl).then(() => {
            return get("templatesUser").then(tpl => {
                return dbLocal.exeCreate('__templateUser', tpl);
            });
        })
    });
}

function checkMenuActive() {
    $(".menu-li").removeClass("active").each(function (i, e) {
        if ($(e).attr("rel") === app.file || $(e).find("[rel='" + app.file + "']").length || $(e).find("a[href='" + app.file + "']").length)
            $(e).addClass("active");
    });
}

function checkFormNotSaved() {
    if (typeof form === "object" && typeof checkformSaved !== "undefined" && !checkformSaved && !isEmpty(form) && !form.saved && !confirm("Alterações não salvas. Sair mesmo assim?")) {
        return !1
    }
    checkformSaved = !0;
    return !0
}

function clearHeaderScrollPosition() {
    lastPositionScroll = 0;
    sentidoScrollDown = !1;
    $("#core-header").css({"position": "fixed", "top": 0});
}

function clearPage() {
    forms = [];
    grids = [];
    closeSidebar();
    clearHeaderScrollPosition();
}

function defaultPageTransitionPosition(direction, $element) {
    aniTransitionPage = $element;
    let left = $element[0].getBoundingClientRect().left;
    let topHeader = $("#core-header").css("opacity") !== "0" ? $("#core-header")[0].clientHeight : 0;
    $element.css({
        "min-height": ($element.attr("id") === "core-content" ? (window.innerHeight - topHeader - (window.innerWidth < 900 && $("#core-header-nav-bottom").css("opacity") !== "0" && $("#core-header-nav-bottom").hasClass("s-show") ? 50 : 0)) : 0) + "px",
        "position": "fixed",
        "top": $element[0].getBoundingClientRect().top + "px",
        "width": $element[0].clientWidth + "px",
        "left": left + "px",
        "overflow": "hidden"
    });

    let file = app.file.split("/");
    file = file[0];
    let $aux = $element.clone().css({"top": topHeader + "px"}).removeAttr("id").removeClass('r-' + $element.data("file")).addClass("r-network r-403 r-" + (file === "dashboard" ? "dashboard r-panel" : file)).data("file", file).html("").insertBefore($element);
    $element.css("margin-top", 0);
    if (direction === 'forward') {
        if (window.innerWidth < 900)
            $aux.animate({left: '100%', opacity: 1}, 0); else $aux.animate({left: (left + 100) + 'px', opacity: 0}, 0);
        $element.animate({opacity: 1}, 0)
    } else if (direction === 'back') {
        if (window.innerWidth < 900)
            $aux.animate({left: '-100%', opacity: 1}, 0); else $aux.animate({left: (left - 100) + 'px', opacity: 0}, 0);
        $element.animate({opacity: 1}, 0)
    } else if (direction === 'fade') {
        $aux.animate({opacity: 0}, 0);
        $element.animate({opacity: 1}, 0)
    }
    return $aux
}

function animateTimeout($element, $aux, scroll) {
    $aux.attr("id", $element.attr('id')).css({
        "position": "relative",
        "top": "initial",
        "left": "initial",
        "width": "100%"
    }).removeClass("notop");
    $element.remove();
    aniTransitionPage = null;
    window.scrollTo(0, scroll);
    clearHeaderScrollPosition();

    //add or not space on end content (navbar space)
    if (window.innerWidth < 900 && $("#core-header-nav-bottom").css("opacity") !== "0" && $("#core-header-nav-bottom").hasClass("s-show"))
        $("#core-content").addClass("mb-50");
    else
        $("#core-content").removeClass("mb-50");
}

function animateForward(id, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('forward', $element);
    let left = $element[0].getBoundingClientRect().left;

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            let topHeader = !$("#core-header").hasClass("notop") ? $("#core-header")[0].clientHeight : 0;
            $aux.css("top", topHeader + "px");

            if (window.innerWidth < 900) {
                $aux.animate({left: '0'}, 150, () => {
                    animateTimeout($element, $aux, 0)
                });
                $element.animate({left: '-100%'}, 150)
            } else {
                $aux.animate({left: left + "px", opacity: 1}, 150, () => {
                    animateTimeout($element, $aux, 0)
                });
                $element.animate({left: (left - 100) + "px", opacity: 0}, 100)
            }
        }
    }, 50);

    return $aux
}

function animateBack(id, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('back', $element);
    let left = $element[0].getBoundingClientRect().left;

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            let topHeader = !$("#core-header").hasClass("notop") ? $("#core-header")[0].clientHeight : 0;
            $aux.animate({top: -(scroll - topHeader) + "px"}, 0);
            if (window.innerWidth < 900) {
                $aux.animate({left: '0'}, 150, () => {
                    animateTimeout($element, $aux, scroll);
                });
                $element.animate({left: '100%'}, 150)
            } else {
                $aux.animate({left: left + 'px', opacity: 1}, 150, () => {
                    animateTimeout($element, $aux, scroll)
                });
                $element.animate({opacity: 0}, 100);
            }
        }
    }, 50);

    return $aux
}

function animateFade(id, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('fade', $element);

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            scroll = typeof scroll !== "undefined" ? scroll : 0;
            let topHeader = !$("#core-header").hasClass("notop") ? $("#core-header")[0].clientHeight : 0;
            $aux.animate({top: -(scroll - topHeader) + "px"}, 0);
            if (window.innerWidth < 900) {
                $aux.animate({left: 0}, 0).animate({opacity: 1}, 200, () => {
                    animateTimeout($element, $aux, scroll)
                })
            } else {
                $aux.animate({left: 0}, 0).animate({opacity: 1}, 200, () => {
                    animateTimeout($element, $aux, scroll)
                })
            }

            $element.animate({opacity: 0, left: '100%'}, 0);
        }
    }, 50);

    return $aux
}

function animateNone(id, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('fade', $element);

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            scroll = typeof scroll !== "undefined" ? scroll : 0;
            let topHeader = !$("#core-header").hasClass("notop") ? $("#core-header")[0].clientHeight : 0;
            $aux.animate({top: -(scroll - topHeader) + "px", left: 0, opacity: 1}, 0, () => {
                animateTimeout($element, $aux, scroll)
            });
            $element.animate({opacity: 0, left: '100%'}, 0);
        }
    }, 50);

    return $aux
}

function headerShow(show) {
    $("#core-header").addClass("core-transition");
    setTimeout(function () {
        $("#core-header").removeClass("core-transition");
    }, 300);
    if (show) {
        $("#core-header").addClass("core-show-header-navbar");
    } else {
        $("#core-header").removeClass("core-show-header-navbar").css({"transform": "translateY(-" + $("#core-header")[0].clientHeight + "px)"});
    }
}

if (SERVICEWORKER) {
    Promise.all([]).then(() => {
        if (navigator.serviceWorker.controller) {
            return navigator.serviceWorker.ready.then(function (swReg) {
                swRegistration = swReg;
            });
        } else {
            return navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION).then(function (swReg) {
                swRegistration = swReg;
            });
        }
    }).then(() => {
        /**
         * Check if have permission to send notification but not is registered on service worker
         * */
        swRegistration.pushManager.getSubscription().then(function (subscription) {
            if (subscription === null) {
                return swRegistration.pushManager.permissionState({userVisibleOnly: !0}).then(p => {
                    if (p === "granted" && PUSH_PUBLIC_KEY !== "")
                        return subscribeUser(1);
                });
            }
        });
    });
}

function getPageHeight(haveHeader, navbar) {
    haveHeader = typeof haveHeader === "undefined" ? $("#core-header").css("opacity") === "1" : haveHeader;
    navbar = typeof navbar === "undefined" || navbar;
    let topHeader = haveHeader ? $("#core-header")[0].clientHeight : 0;
    return (window.innerHeight - topHeader - (window.innerWidth < 900 && navbar && $("#core-header-nav-bottom").hasClass("s-show") ? 50 : 0));
}

var dicionarios,
    swRegistration = null,
    aniTransitionPage = null,
    lastPositionScroll = 0,
    sentidoScrollDown = !1,
    historyPosition = 1,
    historyReqPosition = 0,
    loadingEffect = null,
    appInstalled = !1,
    deferredPrompt;

const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
};
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

function acceptInstallApp() {
    if (!appInstalled) {
        closeInstallAppPrompt(1);
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then(choiceResult => {
            appInstalled = choiceResult.outcome === 'accepted';
            setCookie("installAppAction", appInstalled);
            if (appInstalled)
                post("config", "appInstaled", {success: !0, ios: isIos()});
            else
                post("config", "appInstaled", {success: !1, ios: isIos()});
        });
    }
}

function closeInstallAppPrompt(onInstall) {
    let $installCard = $("#installAppCard").addClass("activeClose");
    $("#core-overlay").removeClass("active activeBold");
    setCookie("installAppAction", "false");
    post("config", "appInstaledPrompt", {success: typeof onInstall !== "undefined", ios: isIos()});

    setTimeout(function () {
        $installCard.remove();
    }, 300);
}

function openInstallAppPrompt(force) {
    if (!appInstalled && !isInStandaloneMode() && typeof deferredPrompt !== "undefined") {
        if ((typeof force === "boolean" && force) || getCookie("installAppAction") === "") {
            getTemplates().then(tpl => {
                $("#core-overlay").addClass("active activeBold");
                $("#app").append(Mustache.render((isIos() ? tpl.installAppCard : tpl.installAppCard), {
                    home: HOME,
                    favicon: FAVICON,
                    sitename: SITENAME,
                    nome: USER.nome
                }));
            });
        }
    }
}

/**
 * app global de navegação do app
 * */
var app = {
    file: "",
    route: "",
    loading: !1,
    removeLoading: function () {
        app.loading = !1;
        $("#core-loader").css("display", "none");
        $("html").css("opacity", 1);
        clearInterval(loadingEffect);
    }, setLoading: function () {
        app.loading = !0;
        $("#core-loader").css("display", "block");
        $("html").css("opacity", .9);

        loadingEffect = setInterval(function () {
            $("#core-header").loading();
        }, 1900);
    }, applyView: function (file, $div) {
        $div = typeof $div === "undefined" ? $("#core-content") : $div;

        /* SET LOADING */
        app.setLoading();

        return view(file, function (g) {
            if (g) {
                if (file === "403" || app.haveAccessPermission(g.setor, g["!setor"])) {
                    TITLE = g.title;
                    headerShow(g.header);
                    checkMenuActive();

                    $("#core-title").text(g.title);

                    $div.html("<style class='core-style'>" + g.css + (g.header ? "#core-content { margin-top: " + $("#core-header")[0].clientHeight + "px }" : "#core-content { margin-top: 0}") + "</style>");
                    $div.append(g.content);

                    /**
                     * Define as constantes do front
                     */
                    FRONT = typeof FRONT.VARIAVEIS !== "undefined" ? {VARIAVEIS: FRONT.VARIAVEIS} : {};
                    if (!isEmpty(g.front) && typeof g.front === "object") {
                        for (let col in g.front)
                            FRONT[col.toUpperCase()] = g.front[col];
                    }

                    if (!g.header)
                        $div.addClass("notop");

                    if (g.navbar)
                        $("#core-header-nav-bottom").addClass("core-show-header-navbar");
                    else
                        $("#core-header-nav-bottom").removeClass("core-show-header-navbar");

                    let minHeightContent = ($div.attr("id") === "core-content" || typeof $div.attr("id") === "undefined" ? getPageHeight(g.header, g.navbar) : 0);
                    $div.css("min-height", minHeightContent + "px");
                    if (file === "dashboard")
                        $(".dashboard-main, #dashboard").css("min-height", minHeightContent + "px");

                    if (g.js.length) {
                        $.cachedScript(g.js).then(() => {
                            app.removeLoading();
                        }).catch(() => {
                            app.removeLoading();
                        })
                    } else {
                        app.removeLoading();
                    }
                    if (g.font.length) {
                        $.each(g.font, function (i, url) {
                            if (!$("head").find("link[href='" + url + "']").length)
                                $("<link />").attr("href", url).attr("rel", "stylesheet").attr('type', 'text/css').attr('media', 'all').data("assets", "core-assets").appendTo("head")
                        })
                    }
                } else {
                    if (USER.setor === 0 && getCookie("redirectOnLogin") === "")
                        setCookie("redirectOnLogin", file);

                    location.href = HOME + g.redirect;
                }
            } else {
                $div.html("");
                app.removeLoading()
            }
        });
    }, haveAccessPermission: function (setor, notSetor) {
        let allow = !0;
        let meuSetor = USER.setor.toString();
        if (!isEmpty(setor)) {
            allow = !1;
            if (setor.constructor === Array) {
                $.each(setor, function (i, seto) {
                    if (seto.toString() === meuSetor) {
                        allow = !0;
                        return !1
                    }
                })
            } else if (setor.toString() === meuSetor) {
                allow = !0
            }
        } else if (!isEmpty(notSetor)) {
            if (notSetor.constructor === Array) {
                $.each(notSetor, function (i, seto) {
                    if (seto.toString() === meuSetor)
                        return allow = !1
                })
            } else if (notSetor.toString() === meuSetor) {
                allow = !1
            }
        }
        return allow;
    }, loadView: function (route, $div, nav) {
        return pageTransition(route, 'route', (typeof route === "undefined" ? 'fade' : 'forward'), $div, "", undefined, nav);
    }
};

/**
 *
 * @param route
 * @param type
 * @param animation
 * @param target
 * @param param
 * @param scroll
 * @param setHistory
 * @param replaceHistory
 * @returns {Promise<unknown[]>}
 */
function pageTransition(route, type, animation, target, param, scroll, setHistory, replaceHistory) {
    let reload = typeof route === "undefined";
    route = (typeof route === "string" ? route : location.href).replace(HOME, '');
    route = route === "/" ? "" : route;
    type = typeof type === "string" ? type : "route";
    animation = typeof animation === "string" ? animation : "forward";
    target = typeof target === "string" ? target : "#core-content";
    param = (typeof param === "object" && param !== null && param.constructor === Object ? param : {});
    scroll = typeof scroll !== "undefined" && !isNaN(scroll) ? parseInt(scroll) : document.documentElement.scrollTop;
    setHistory = typeof setHistory === "undefined" || ["false", "0", 0, !1].indexOf(setHistory) === -1;
    replaceHistory = typeof replaceHistory !== "undefined" && ["true", "1", 1, !0].indexOf(replaceHistory) > -1;
    let file = route === "" ? "index" : route;
    let novaRota = type !== "route" || route !== app.route;
    if (!app.loading && !aniTransitionPage) {
        clearPage();
        app.route = route;
        app.file = file;
        if (!$(target).length) {
            historyReqPosition++;
            historyPosition = -2;
            history.back();
            return
        }
        if (!history.state)
            history.replaceState({
                id: 0,
                route: app.route,
                type: "route",
                target: "#core-content",
                param: {},
                scroll: scroll
            }, null, HOME + app.route); else if (setHistory)
            history.replaceState({
                id: history.state.id,
                route: history.state.route,
                type: history.state.type,
                target: history.state.target,
                param: history.state.param,
                scroll: scroll
            }, null, HOME + history.state.route);
        if (setHistory && !reload && novaRota) {
            if (replaceHistory) {
                history.replaceState({
                    id: historyPosition++,
                    route: route,
                    type: type,
                    target: target,
                    param: param,
                    scroll: 0
                }, null, HOME + route);
            } else {
                history.pushState({
                    id: historyPosition++,
                    route: route,
                    type: type,
                    target: target,
                    param: param,
                    scroll: 0
                }, null, HOME + route);
            }
        }
        return Promise.all([]).then(() => {

            if (historyReqPosition)
                animation = "none";
            let $page = window["animate" + ucFirst(animation)](target, scroll);

            if (type === 'route') {
                return app.applyView(file, $page)
            } else if (type === 'grid') {
                $page.grid(history.state.route)
            } else if (type === 'form') {

                let id = typeof param === "object" && typeof param.id !== "undefined" && !isNaN(param.id) ? parseInt(param.id) : "";
                let parent = typeof param === "object" && typeof param.parent === "string" ? param.parent : null;
                let parentColumn = typeof param === "object" && typeof param.column === "string" ? param.column : null;
                let store = typeof param.store === "undefined" || ["false", "0", 0, false].indexOf(param.store) === -1 ? 1 : 0;
                let data = (typeof param === "object" && typeof param.data === "object" && !isEmpty(param.data) ? param.data : {});

                if (!isEmpty(id))
                    data.id = id;
                else if (!isEmpty(data.id))
                    id = parseInt(data.id);

                /**
                 * ## Identificador ##
                 * Recebe identificador por parâmetro
                 * Busca identificador no history, ou cria um novo
                 * */
                let identificador = "";
                if (typeof param === "object" && typeof param.identificador === "string") {
                    identificador = param.identificador;
                    history.state.param.identificador = identificador;
                    history.replaceState(history.state, null, HOME + app.route);

                } else if (typeof history.state.param === "object" && typeof history.state.param.identificador !== "undefined") {
                    identificador = history.state.param.identificador;

                } else {
                    identificador = Math.floor((Math.random() * 1000)) + "" + Date.now();
                    history.state.param.identificador = identificador;
                    history.replaceState(history.state, null, HOME + app.route);
                }

                /**
                 * Dados do formulário relacional recebido,
                 * atualiza history com os novos dados
                 * */
                let promisses = [];
                let haveFormRelation = (!isEmpty(form) && form.saved && form.modified && form.id !== "" && formNotHaveError(form.error) && typeof history.state.param === "object" && typeof history.state.param.openForm === "object" && history.state.param.openForm.identificador === form.identificador);
                let isUpdateFormRelation = !1;

                if (haveFormRelation) {
                    if (history.state.param.openForm.tipo === 1) {
                        if (dicionarios[history.state.route][history.state.param.openForm.column].type === "int") {
                            data[history.state.param.openForm.column] = form.id;
                        } else {
                            if (typeof data[history.state.param.openForm.column] === "undefined" || data[history.state.param.openForm.column] === null || isEmpty(data[history.state.param.openForm.column]))
                                data[history.state.param.openForm.column] = [];

                            data[history.state.param.openForm.column].push(form.id.toString());
                        }

                        isUpdateFormRelation = !0;
                    } else {
                        if (typeof data[history.state.param.openForm.column] !== "object" || data[history.state.param.openForm.column] === null || data[history.state.param.openForm.column].constructor !== Array)
                            data[history.state.param.openForm.column] = [];

                        if (data[history.state.param.openForm.column].length) {
                            $.each(data[history.state.param.openForm.column], function (i, e) {
                                if (isUpdateFormRelation = (e.id == form.data.id)) {

                                    promisses.push(getRelevantTitle(form.entity, form.data).then(title => {
                                        form.data.columnTituloExtend = title;
                                        form.data.columnName = history.state.param.openForm.column;
                                        form.data.columnRelation = history.state.param.openForm.entity;
                                        form.data.columnStatus = {column: '', have: !1, value: !1};

                                        pushToArrayIndex(data[history.state.param.openForm.column], form.data, i);
                                    }));
                                    return !1
                                }
                            });
                        }
                    }
                }

                Promise.all(promisses).then(() => {
                    if (haveFormRelation) {
                        if (!isUpdateFormRelation)
                            data[history.state.param.openForm.column].push(form.data);

                        delete history.state.param.openForm;
                        history.state.param.data = data;
                        history.replaceState(history.state, null, HOME + app.route)
                    }

                    /**
                     * Gera formulário
                     * */
                    form = formCrud(history.state.route, $page, parent, parentColumn, store, identificador);

                    if (!isEmpty(data) && (Object.keys(data).length > 1 || typeof data.id === "undefined")) {
                        form.setData(data);
                        id = "";
                    }

                    form.show(id);

                    if (haveFormRelation || history.state.param.modified) {
                        form.saved = !1;
                        form.modified = !0;
                    }
                });
            }
        }).then(() => {
            if (historyReqPosition) {
                let t = setInterval(function () {
                    if (!aniTransitionPage) {
                        clearInterval(t);
                        historyPosition = -9;
                        history.go(historyReqPosition);
                        historyReqPosition = 0
                    }
                }, 50)
            }
        });
    }
}

/**
 * Função para ler history state atual independente dos parâmetros
 * caso a página não seja uma rota, retorna até encontrar rota
 * e depois avança até a rota requisitada (historyReqPosition)
 * */
function readRouteState() {
    if (history.state) {
        if (history.state.type === "route") {
            return pageTransition(history.state.route, history.state.type, "fade", history.state.target, history.state.param, history.state.scroll, !1);
        } else {

            /**
             * Seta valor que faz o navigation back cair nessa mesma função (recursivo)
             * */
            historyReqPosition++;
            historyPosition = -2;
            history.back();
        }
    } else {
        return app.loadView()
    }
}

/**
 * Header menu hide on scroll down and show when scroll up
 * */
function headerScrollFixed(sentidoScroll) {
    sentidoScrollDown = sentidoScroll;
    let elTop = document.getElementById("core-header").getBoundingClientRect().top;
    let topHeader = $("#core-header").css("opacity") !== "0" ? $("#core-header")[0].clientHeight : 0;
    let t = $(window).scrollTop() + (elTop < -topHeader ? -topHeader : elTop);
    $("#core-header").css("top", t + "px")
}

function updateHeaderPosition(revision) {
    if (lastPositionScroll < $(window).scrollTop()) {
        if (!sentidoScrollDown) {
            headerScrollFixed(!0);
            $("#core-header").css("position", "absolute");
        }
    } else {
        if (sentidoScrollDown) {
            headerScrollFixed(!1);
        } else if (document.getElementById("core-header").getBoundingClientRect().top >= 0) {
            $("#core-header").css({"position": "fixed", "top": 0})
        } else {
            if (typeof revision === "undefined") {
                setTimeout(function () {
                    updateHeaderPosition(true);
                }, 50);
            }
        }
    }
    lastPositionScroll = $(window).scrollTop();
}

/**
 * Ao carregar todo o documento executa esta função
 */
function onLoadDocument() {

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.onpopstate = function (event) {
        if (event.state) {

            if (historyPosition === -2) {
                /**
                 * Busca última rota de view (type = route)
                 * */
                readRouteState();

            } else if (historyPosition === -1) {
                /**
                 * Somente atualiza historyPosition
                 * */

            } else if (checkFormNotSaved()) {
                /**
                 * Carrega página da navegação solicitada
                 * */
                clearPage();
                let animation = (historyPosition > event.state.id ? (historyReqPosition || ($("#dashboard").length && history.state.route === "dashboard") ? "none" : "back") : (historyPosition === -9 ? "none" : "forward"));
                pageTransition(event.state.route, event.state.type, animation, event.state.target, event.state.param, event.state.scroll, !1);

            } else {
                /**
                 * navegação cancelada, volta state do history que já foi aplicado
                 * */
                if (historyPosition < event.state.id)
                    history.back();
                else
                    history.forward();

                historyPosition = -1;
                return;
            }

            historyPosition = event.state.id + 1;
        }
    };

    window.onscroll = function () {
        if (window.innerWidth < 994)
            updateHeaderPosition();
    };

    window.onresize = function () {
        clearHeaderScrollPosition();
        $("#core-content, .dashboard-main, #dashboard").css("min-height", getPageHeight() + "px");

        if (window.innerWidth < 994)
            updateHeaderPosition();
    };

    /**
     * Intercepta clicks em links e traduz na função "pageTransition()"
     */
    $("body").off("click", "a").on("click", "a", function (e) {
        let url = $(this).attr("href").replace(HOME, '');

        if (url === "#back") {
            e.preventDefault();
            history.back();
        } else {
            let animation = $(this).data("animation") || "forward";
            let target = $(this).data("target") || "#core-content";
            let route = $(this).data("route") || "route";
            let p = new RegExp(/^#/i);
            let pjs = new RegExp(/^javascript/i);
            if ($(this).attr("target") !== "_blank" && !p.test(url) && !pjs.test(url)) {
                e.preventDefault();
                pageTransition(url, route, animation, target);
            }
        }

        /**
         * Intercepta todos os submits de formulários
         */
    }).off("submit", "form").on("submit", "form", function (e) {
        e.preventDefault()
    });

    /**
     * Open Keyboard simulate
     */
    $("#app").on("focus", "input, textarea", function (e) {
        openKeyboradSimulate();
    });

    /**
     * Default button header sidebar toggle click
     */
    $(".core-open-menu").off("click").on("click", function () {
        toggleSidebar();
    });
}

function startApplication() {
    let isFirstAccess = getCookie("accesscount") === "";

    if(isFirstAccess) {
        $("#core-spinner").css("stroke", THEMETEXT);
        $("html").css("background", THEME);
    }
    onLoadDocument();
    checkSessao().then(() => {
        let promessa = [];
        promessa.push(isFirstAccess ? firstAccess() : thenAccess());

        return Promise.all(promessa).then(() => {
            $.cachedScript(HOME + "assetsPublic/core/" + USER.setor + "/core.min.js?v=" + VERSION);
            $("head").append("<link rel='stylesheet' href='" + HOME + "assetsPublic/core/" + USER.setor + "/core.min.css?v=" + VERSION + "'>");

            return menuHeader();

        }).then(() => {

            /**
             * Carrega a rota atual
             */
            return readRouteState();

        }).then(() => {

            /**
             * Verifica se existe uma versão mais recente do app
             */
            return checkUpdate();

        }).then(() => {

            if(isFirstAccess) {
                $("html").css("background", "#eeeeee");
                $("#core-spinner").css("stroke", THEME);
            }
        });
    });
}

$(function () {
    if (location.href !== HOME + "updateSystem") {
        startApplication();

    } else {
        return clearCacheAll().then(() => {
            return setCookieAnonimo().then(() => {
                return readRouteState();
            });
        });
    }
});