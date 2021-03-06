"use strict";

/**
 * Test via a getter in the options object to see if the passive property is accessed
 * @type {boolean}
 */
let supportsPassive = false;
try {
    var opts = Object.defineProperty({}, 'passive', {
        get: function() {
            supportsPassive = true;
        }
    });
    window.addEventListener("testPassive", null, opts);
    window.removeEventListener("testPassive", null, opts);
} catch (e) {}

/**
 * Load a url content into a javascript variable
 * return the content and a second time return the variable
 * @param name
 * @param url
 * @returns {Promise<Window>}
 */
async function getFileInMemory(name, url) {
    if(typeof window[name] === "undefined") {
        if(window.hasOwnProperty("cordova"))
            url = url.replace(HOME, "").replace("?v=" + VERSION, "");

        window[name] = await $.get(url);
    }

    return window[name];
}

/**
 * Execute a function when the app is not loading or transition to a Page
 * @param funcao
 * @returns {Promise<void>}
 */
async function exeFunction(funcao) {
    setTimeout(async function () {
        while(app.loading || app.loadingScripts)
            await sleep(10);

        funcao();
    }, 1);
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

/**
 * @param number
 * @param decPlaces
 * @param decSep
 * @param thouSep
 * @returns {string}
 */
function formatMoney(number, decPlaces, decSep, thouSep) {
    decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSep = typeof decSep === "undefined" ? "." : decSep;
    thouSep = typeof thouSep === "undefined" ? "," : thouSep;
    let sign = number < 0 ? "-" : "";
    let i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    let j = i.length > 3 ? i.length % 3 : 0;

    return sign +
        (j ? i.substr(0, j) + thouSep : "") +
        i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
        (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "");
}

/**
 * Check if is in Android
 * @returns {boolean}
 */
function isAndroid() {
    return navigator.userAgent.toLowerCase().indexOf("android") > -1;
}

/**
 * Load a lottie player using memory to keep lottie
 * @param url
 * @param querySelector
 * @returns {Promise<void>}
 */
async function loadLottiePlayer(url, querySelector) {
    let selector = document.querySelector(typeof querySelector === "string" ? querySelector : "lottie-player");
    if(selector)
        selector.load(await getFileInMemory(slug(url, "_"), url));
}

function isMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function isBuild() {
    return !SERVICEWORKER && HOME === "";
}

function isEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function isCPF(cpf) {
    if (cpf === "" || cpf === null)
        return !0;
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999")
        return !1;
    let add = 0;
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    let rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9)))
        return !1;
    add = 0;
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10)))
        return !1;
    return !0
}

function isCNPJ(cnpj) {
    if (cnpj === "" || cnpj === null)
        return !0;
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj.length != 14)
        return !1;
    if (cnpj == "00000000000000" || cnpj == "11111111111111" || cnpj == "22222222222222" || cnpj == "33333333333333" || cnpj == "44444444444444" || cnpj == "55555555555555" || cnpj == "66666666666666" || cnpj == "77777777777777" || cnpj == "88888888888888" || cnpj == "99999999999999")
        return !1;
    let tamanho = cnpj.length - 2
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return !1;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return !1;
    return !0
}

function dateTimeFormat(date) {
    let dateObj = new Date(date || Date.now());
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    let hour = String(dateObj.getHours()).padStart(2, '0');
    let min = String(dateObj.getMinutes()).padStart(2, '0');
    let sec = String(dateObj.getSeconds()).padStart(2, '0');
    return year + '-' + month + '-' + day + " " + hour + ":" + min + ":" + sec;
}

function dateFormat(date) {
    let dateObj = new Date(date || Date.now());
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return day + '/' + month + '/' + year;
}

function timeFormat(date) {
    let dateObj = new Date(date || Date.now());
    let hour = String(dateObj.getHours()).padStart(2, '0');
    let min = String(dateObj.getMinutes()).padStart(2, '0');
    let sec = String(dateObj.getSeconds()).padStart(2, '0');
    return hour + ":" + min + ":" + sec;
}

function timeFormatWithoutSeconds(date) {
    return timeFormat(date).substring(0, 5)
}

/**
 * Adiciona script na página com cach
 * @param url
 * @param options
 * @returns {*}
 */
$.cachedScript = async function (url, options) {
    return $.ajax($.extend(options || {}, {dataType: "script", cache: !0, url: url}))
};

/**
 * Primeiro caractere em caixa alta
 * @param string
 * @returns {string}
 */
function ucFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

// Quote regular expression characters plus an optional character
function preg_quote(str, delimiter) {
    return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
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

function dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1)
    }
    return function (a, b) {
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder
    }
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
 * use like: await sleep(100) to await for 100 mileseconds
 * @param ms
 * @returns {Promise<unknown>}
 */
function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

/**
 * Verifica se variável é numérica
 * @param n
 * @returns {boolean|boolean}
 */
function isNumber(n) {
    return n !== null && !isNaN(n) && (n.constructor === String || n.constructor === Number);
}

/**
 * Verifica se variável é numérica e positiva
 * @param n
 * @returns {boolean|boolean}
 */
function isNumberPositive(n) {
    return n !== null && !isNaN(n) && (n.constructor === String || n.constructor === Number) && n > 0;
}

/**
 * @param key
 * @param value
 * @returns {{}}
 */
function createObjectWithStringDotNotation(key, value) {
    let result = {};
    let object = {};
    let arr = key.split('.');
    for (let i = 0; i < arr.length - 1; i++)
        object = object[arr[i]] = {};

    object[arr[arr.length - 1]] = value;
    return result;
}

function getObjectDotNotation(obj, dotnotation) {
    let arr = dotnotation.split(".");
    while (arr.length && (obj = obj[arr.shift()])) ;
    return obj;
}

/**
 * Obtém o número de parametros do objeto
 * @param obj
 * @returns {number}
 */
Object.size = function (obj) {
    let size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function _htmlTemplateJsonDecode(txt, render) {
    let txtRender = render(txt);
    if (!isEmpty(txtRender)) {
        let txtc = document.createElement("textarea");
        txtc.innerHTML = txtRender;
        txt = txtc.value.split(',');
        let variavel = txt.pop();
        txt = txt.join(",");

        if (isJson(txt))
            return $.trim(getObjectDotNotation(JSON.parse(txt), variavel));
    }
    return "";
}

/**
 *
 * @param bool isSkeleton
 * @param object param
 * @returns {[]}
 * @private
 */
function _htmlTemplateDefaultParam(isSkeleton, param) {
    let p = [];
    let parametros = !isEmpty(history.state) && !isEmpty(history.state.param) ? history.state.param : {};
    mergeObject(p, {
        home: HOME,
        vendor: VENDOR,
        favicon: FAVICON,
        logo: LOGO,
        theme: THEME,
        themetext: THEMETEXT,
        sitename: SITENAME,
        USER: USER,
        LOCALSTORAGE: {},
        PARAM: parametros.url,
        PAGE: parametros
    });

    for(let c in localStorage)
        p.LOCALSTORAGE[c] = (isNumberPositive(localStorage[c]) ? parseFloat(localStorage[c]) : (localStorage[c] === "false" ? !1 : (localStorage[c] === "true" ? !0 : (isJson(localStorage[c]) ? JSON.parse(localStorage[c]) : localStorage[c]))));

    if (!isSkeleton)
        mergeObject(p, param);

    return p;
}

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

    $.fn.dbExeRead = async function() {
        let $this = $(this);

        if(!$this.hasAttr("data-db"))
            return [];

        let param = {USER: USER, PARAM: PARAM};
        let entity = Mustache.render($this.data("db"), param);
        let id = ($this.hasAttr("data-id") ? $this.attr("data-id") : {});
        id = isNumberPositive(id) ? parseInt(id) : (isJson(id) ? JSON.parse(id) : (typeof id === "string" ? {"*": "%" + id + "%"} : {}));
        let limit = ($this.hasAttr("data-limit") ? parseInt(Mustache.render($this.attr("data-limit"), param)) : null);
        let offset = ($this.hasAttr("data-offset") ? parseInt(Mustache.render($this.attr("data-offset"), param)) : null);
        let order = ($this.hasAttr("data-order") ? Mustache.render($this.data("order"), param) : null);
        let orderReverse = ($this.hasAttr("order") ? $this.data("order") : null);
        return db.exeRead(entity, id, limit, offset, order, orderReverse);
    }

    /**
     * Create the skeleton style
     */
    $.fn._skeletonDOMApply = async function($tpl, param) {
        let $this = $(this);
        let templateTpl = ($tpl.hasAttr("data-template") ? (await getTemplates())[$tpl.data("template")] : $tpl.html()).replace(/<img /gi, "<img onerror=\"this.classList.add('skeleton');this.src='" + HOME + "assetsPublic/img/loading.png'\"");
        let loop = $tpl.hasAttr('data-template-loop') ? $tpl.data("template-loop") : 1;

        /**
         * Find content to add class skeleton
         */
        let loo = templateTpl.split("{{");
        if (loo.length) {
            let novotemplateTpl = "";
            let awaitUntil = "";
            for (let i in loo) {
                if (i > 0) {
                    let p = loo[i].split("}}")[0].replace("{", "").trim();
                    let a = loo[i - 1];

                    /**
                     * Check if is waiting for a loop ends
                     */
                    if (awaitUntil !== "") {
                        if (p === awaitUntil)
                            awaitUntil = "";

                        novotemplateTpl += a + "{{";
                        continue;
                    }

                    /**
                     * Check if is a loop
                     */
                    if (/^#/.test(p)) {
                        p = p.replace("#", "");
                        if (p !== "." && typeof getObjectDotNotation(param, p) !== "undefined") {

                            /**
                             * If is a loop and have the variable declared on param,
                             * so render this and ignore skeleton
                             */
                            awaitUntil = "/" + p;
                            novotemplateTpl += a + "{{";
                            continue;
                        } else {

                            /**
                             * Create a array empty to loop into skeleton struct
                             */
                            if (p === ".") {
                                for (let e = 0; e < loop; e++)
                                    param.push([]);
                            } else if (!/(^is\w+|\.is\w+|ativo|status|active)/.test(p)) {
                                let vp = [];

                                for (let e = 0; e < loop; e++)
                                    vp.push({});

                                mergeObject(param, createObjectWithStringDotNotation(p, vp));
                            }
                        }
                    }

                    /**
                     * Var not exist on param, so add skeleton
                     */
                    if (typeof getObjectDotNotation(param, p) === "undefined" && /(^\w|{)/.test(p) && !/^(USER\.|sitename)/.test(p)) {
                        if (/>[\w$\s]*$/.test(a))
                            a = a.replace(/>([\w$\s]*)$/, " data-skeleton='1'>$1");
                    }

                    novotemplateTpl += a + "{{";
                }
            }
            templateTpl = novotemplateTpl + loo[loo.length - 1];
        }

        $this.html(Mustache.render(templateTpl, param)).find("[data-skeleton='1']").addClass("skeleton");
    };

    /**
     * Render template with data-db
     * @param $tpl
     * @returns {Promise<void>}
     * @private
     */
    $.fn._renderDbTemplate = async function($tpl) {
        let $this = $(this);
        if(!$this.hasAttr("data-db"))
            return;

        let $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();

        /**
         * get the data to use on template if need
         */
        let dados = await $this.dbExeRead();

        if($this.hasAttr("data-realtime-db"))
            localStorage.setItem('lastDataFromDBCache-' + $this.attr("data-db"), btoa(JSON.stringify(dados)));

        if($this.hasAttr("data-db-function") && $this.data("db-function") !== "" && typeof window[$this.data("db-function")] === "function")
            dados = await window[$this.data("db-function")](dados);
        else if($this.hasAttr("data-function") && $this.data("function") !== "" && typeof window[$this.data("function")] === "function")
            dados = await window[$this.data("function")](dados);
        else if($this.hasAttr("data-realtime-db") && $this.data("realtime-db") !== "" && typeof window[$this.data("realtime-db")] === "function")
            dados = await window[$this.data("realtime-db")](dados);

        let parametros = null;

        if(isEmpty(dados) && $this.hasAttr("data-template-empty")) {
            parametros = ($this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
            $templateChild = Mustache.render($tpl.data("template-empty"), _htmlTemplateDefaultParam());
        } else {
            parametros = (isEmpty(dados) && $this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
        }

        if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
            parametros = await window[$this.data("param-function")](parametros);

        if(!isEmpty(parametros) && typeof parametros === "object") {
            if(!isEmpty(dados))
                mergeObject(dados, parametros);
            else
                dados = parametros;
        }

        return $this.htmlTemplate($templateChild, dados);
    };

    /**
     * Render template with data-get
     * @param $tpl
     * @param paramSkeleton
     * @returns {Promise<void>}
     * @private
     */
    $.fn._renderGetTemplate = async function($tpl, paramSkeleton) {
        let $this = $(this);
        if(!$this.hasAttr("data-get"))
            return;

        let $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();
        let dados = null;

        /**
         * Check if ignore use of cache attr
         */
        if($this.hasAttr("data-cache") && !$this.data("cache")) {

            /**
             * Apply Skeleton
             * get the data from the server
             */
            $this._skeletonDOMApply($tpl, paramSkeleton);
            dados = await AJAX.get($this.data("get") + "/" + Date.now() + "/maestruView/" + replaceAll(app.file, "/", "[@]"));

        } else {

            let cacheName = '_cache_get_' + replaceAll(app.file, "/", "[@]") + "___" + replaceAll($this.data("get"), "/", "[@]");
            let cache = await dbLocal.exeRead(cacheName);

            /**
             * Store the name of _cache_get to clear after on safari
             * @type {any|*[]}
             */
            let cachedGet = localStorage.cachedGet ? JSON.parse(localStorage.cachedGet) : [];
            cachedGet.push(cacheName);
            localStorage.cachedGet = JSON.stringify(cachedGet);

            if(isEmpty(cache)) {

                /**
                 * Apply Skeleton
                 */
                $this._skeletonDOMApply($tpl, paramSkeleton);

                /**
                 * get the data from the server
                 */
                dados = await AJAX.get($this.data("get") + "/maestruView/" + replaceAll(app.file, "/", "[@]"));

                /**
                 * Cache the data on indexedDB
                 */
                await dbLocal.clear(cacheName);
                dbLocal.exeCreate(cacheName, {id: 1, result: JSON.stringify(dados)});

            } else {

                /**
                 * Update view get cache after use it
                 * Cache the get data on indexedDB and update
                 */
                setTimeout(function () {
                    AJAX.get($this.data("get") + "/maestruView/" + replaceAll(app.file, "/", "[@]")).then(d => {
                        dbLocal.exeCreate(cacheName, {id: 1, result: JSON.stringify(d)});
                    });
                }, 100);

                /**
                 * Retrieve the cache from indexedDB
                 * @type {any}
                 */
                dados = JSON.parse(cache[0].result);
            }
        }

        /**
         * Function on result if have declared
         */
        if ($this.hasAttr("data-get-function") && $this.data("get-function") !== "" && typeof window[$this.data("get-function")] === "function")
            dados = await window[$this.data("get-function")](dados);
        else if ($this.hasAttr("data-function") && $this.data("function") !== "" && typeof window[$this.data("function")] === "function")
            dados = await window[$this.data("function")](dados);
        else if ($this.data("realtime-get") !== "" && typeof window[$this.data("realtime-get")] === "function")
            dados = await window[$this.data("realtime-get")](dados);

        /**
         * Empty param check, and empty template use
         * @type {{}}
         */
        let parametros = {};
        if (isEmpty(dados) && $this.hasAttr("data-template-empty")) {
            parametros = ($this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
            $templateChild = Mustache.render($tpl.data("template-empty"), _htmlTemplateDefaultParam());
        } else {
            parametros = (isEmpty(dados) && $this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
        }

        /**
         * Empty function if declared
         */
        if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
            parametros = await window[$this.data("param-function")](parametros);

        /**
         * Merge empty param with param
         */
        if (!isEmpty(parametros) && typeof parametros === "object") {
            if (!isEmpty(dados))
                mergeObject(dados, parametros);
            else
                dados = parametros;
        }

        /**
         * Render template with the results
         */
        return $this.htmlTemplate($templateChild, dados);
    };

    $.fn._functionsToExecuteAfterTemplate = async function() {
        let $this = $(this);
        /**
         * Função especial que permite adicionar value para um select field
         * no render de templates
         */
        $this.find("select").each(function () {
            if ($(this).hasAttr("data-value"))
                $(this).val($(this).data("value")).trigger("change");
        });
    };

    /**
     * Renderiza template mustache no elemento
     * @param tpl
     * @param paramReceived
     * @returns {Promise<void>}
     */
    $.fn.htmlTemplate = async function (tpl, paramReceived) {
        let $this = this;
        let templates = await getTemplates();
        let isSkeleton = typeof paramReceived === "undefined" || isEmpty(paramReceived);
        let param = _htmlTemplateDefaultParam(isSkeleton, paramReceived);
        let templateTpl = tpl.length > 100 || typeof templates[tpl] === "undefined" ? tpl : templates[tpl];

        /**
         * Render the content with Mustache template
         */
        let $content = $("<div>" + Mustache.render(templateTpl, param, templates) + "</div>");

        /**
         * Await for compile internal templates
         */
        let $templatesToRenderInside = $content.find("[data-template]").not("[data-get]").not("[data-db]");
        if ($templatesToRenderInside.length) {
            await new Promise(async s => {
                $templatesToRenderInside.each(async function () {
                    let $this = $(this);

                    /**
                     * Allow to send data-param-empty to skeleton
                     */
                    if(isEmpty(paramReceived) && $this.hasAttr("data-param-empty"))
                        mergeObject(paramReceived, $this.data("param-empty"));
                    else if(isEmpty(paramReceived) && $this.hasAttr("data-param"))
                        paramReceived = $this.data("param");
                    else if(!isEmpty(paramReceived) && $this.hasAttr("data-param"))
                        mergeObject(paramReceived, $this.data("param"));

                    /**
                     * Allow to apply function on param to skeleton
                     */
                    if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
                        paramReceived = await window[$this.data("param-function")](paramReceived);

                    s($(this).htmlTemplate($(this).data("template"), paramReceived));
                });
            });
        }

        /**
         * Find data-get and data-db to read data without have a db-template
         */
        let $contentDb = $("<div>" + templateTpl + "</div>").find("[data-db]");
        if ($contentDb.length) {
            await new Promise(async s => {
                $contentDb.each(async function (i, e) {
                    let $this = $content.find("[data-db]").eq(i);
                    if($this.length) {

                        /**
                         * Allow to send data-param-empty to skeleton
                         */
                        if(isEmpty(paramReceived) && $this.hasAttr("data-param-empty"))
                            mergeObject(param, $this.data("param-empty"));

                        /**
                         * Allow to apply function on param to skeleton
                         */
                        if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
                            param = await window[$this.data("param-function")](param);

                        /**
                         * Apply Skeleton
                         */
                        $this._skeletonDOMApply($(e), param);

                        /**
                         * Get data and render the template
                         * not await for this
                         */
                        s($this._renderDbTemplate($(e)));
                    }
                });
            });
        }

        let $contentGet = $("<div>" + templateTpl + "</div>").find("[data-get]");
        if ($contentGet.length) {
            await new Promise(async s => {
                $contentGet.each(async function (i, e) {
                    let $this = $content.find("[data-get]").eq(i);
                    if($this.length) {

                        /**
                         * Allow to send data-param-empty to skeleton
                         */
                        if(isEmpty(paramReceived) && $this.hasAttr("data-param-empty"))
                            mergeObject(param, $this.data("param-empty"));

                        /**
                         * Allow to apply function on param to skeleton
                         */
                        if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
                            param = await window[$this.data("param-function")](param);

                        /**
                         * Get data and render the template
                         * not await for this
                         */
                        s($this._renderGetTemplate($(e), param));
                    }
                });
            });
        }

        /**
         * Finish render template
         */
        if(isSkeleton) {
            /**
             * Change the content direct
             */
            $this.html($content.contents());
            $this._functionsToExecuteAfterTemplate();

        } else {
            /**
             * add content as hidden
             */
            let $allOldChildren = $this.children();
            let $allContents = $this.contents();
            $content.addClass("loadingImagesPreview").find(".skeleton").removeClass("skeleton");
            $this.append($content);
            $this._functionsToExecuteAfterTemplate();

            /**
             * Await the content insert on DOM (load)
             * REMOVED the settimeout to test
             */

            /**
             * Remove the old content
             */
            $content.removeClass("loadingImagesPreview").contents().unwrap();
            $allOldChildren.remove();
            $allContents.filter(function () {
                return (this.nodeType == 3);
            }).remove();
        }
    };
}(jQuery));

/**
 * trás valor de objeto com uso de string com ponto separando níveis. ex:"pessoa.contato.email"
 * */
function fetchFromObject(obj, prop) {

    if (typeof obj === 'undefined') {
        return false;
    }

    let _index = prop.indexOf('.');
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

    let _index = prop.indexOf('.')
    if (_index > -1) {
        if (typeof obj[prop.substring(0, _index)] !== "object")
            obj[prop.substring(0, _index)] = {};
        return fetchCreateObject(obj[prop.substring(0, _index)], prop.substr(_index + 1));
    } else {
        if (typeof obj[prop] === "undefined")
            obj[prop] = "";
    }
}

/**
 * LightBox Image preview with touch horizontal change
 * Object jquery arrays images
 * @param $images
 */
function lightBoxTouch($images) {
    $images.off("click").on("click", function () {
        let img = $(this).attr("src");
        let $gallery = $("<img id='previewGallery' src='" + img + "' />").appendTo("#core-content");

        /**
         * Overlay click remove lightbox
         */
        $("#core-overlay").addClass("active").one("click", function () {
            $("#core-overlay").removeClass("active");
            $gallery.remove();
        });

        onHistoryBack(function () {
            $("#core-overlay").removeClass("active");
            $gallery.remove();
        });

        new TouchHorizontal($gallery, 0, 0, 20, function (touch, target, direction) {
            let next = direction === "right";
            let img = $gallery.attr("src");
            let imgBefore = !1;
            let now = !1;
            $images.each(function (i, e) {
                if (now && next) {

                    /**
                     * Next Slide
                     */
                    $gallery.attr("src", $(e).attr("src")).load(function () {
                        $gallery.css("top", "calc(50% - " + ($gallery.height() / 2) + "px")
                    });
                    return !1;
                }
                now = $(e).attr("src") === img;

                /**
                 * Back Slide
                 */
                if (now && imgBefore && !next) {
                    $gallery.attr("src", imgBefore).load(function () {
                        $gallery.css("top", "calc(50% - " + ($gallery.height() / 2) + "px")
                    });
                    return !1;
                }
                imgBefore = $(e).attr("src");
            });
            touch.moveToStart();
        });

        $gallery.load(function () {
            $gallery.css("top", "calc(50% - " + ($gallery.height() / 2) + "px");
        });

        setTimeout(function () {
            $gallery.addClass("active");
        }, 10);
    });
}

function setUpdateVersion() {
    return AJAX.post("update", {update: !0}).then(data => {
        localStorage.update = data;
    }).catch(() => {});
}

function checkUserOptions() {
    $("." + USER.setor + "Show").removeClass("hide");
    $("." + USER.setor + "Hide").addClass("hide");
    $("." + USER.setor + "Allow").removeAttr("disabled");
    $("." + USER.setor + "Disabled").attr("disabled", "disabled");
}

function slug(val, replaceBy) {
    replaceBy = replaceBy || '-';
    let mapaAcentosHex = {
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
    for (let letra in mapaAcentosHex) {
        let expressaoRegular = mapaAcentosHex[letra];
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

function download(filename, text) {
    let element = document.createElement('a');
    let blobData = new Blob([text], {type: 'application/vnd.ms-excel'});
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
    let result = keys.join(comma) + "\n";

    // Add the rows
    array.forEach(function (obj) {
        keys.forEach(function (k, ix) {
            if (ix)
                result += comma;

            let v = "";

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

async function checkUpdate() {
    if (isOnline() && SERVICEWORKER) {
        let latestVersion = await AJAX.post("checkUpdate").catch(() => {});

        if(typeof latestVersion === "object" && latestVersion !== null) {

            /**
             * Check version server to update app info
             * */
            if (!localStorage.update)
                localStorage.update = latestVersion.version_server;
            else if (parseFloat(latestVersion.version_server) > parseFloat(localStorage.update))
                toast("<div class='left'>Nova versão</div><button style='float: right;border: none;outline: none;padding: 10px 20px;border-radius: 5px;margin: -5px -11px -5px 20px;background: #fff;color: #555;cursor: pointer;box-shadow: 0px 2px 5px -4px black' onclick='updateCache()'>atualizar</button>", 15000, "toast-success");

            /**
             * Check version app to require update
             * */
            if(window.hasOwnProperty("cordova")) {
                if(latestVersion.version_app !== "" && latestVersion.version_app > VERSION && typeof showPopUpModal === "function") {
                    showPopUpModal({
                        titulo: "Nova versão",
                        descricao: '<img src="' + HOME + 'public/assets/img/lights.png" style="height:auto;position: absolute;z-index:3;width: 160%;left: -30%;top: -55px;transform:rotate(90deg)">'
                            + '<lottie-player src="' + HOME + 'public/assets/lottie/update.json" style="margin-top: -25px" background="transparent" speed="1" loop autoplay></lottie-player>'
                            + '<div style="position: relative;z-index: 11;text-align: center;font-size: 16px;line-height: 21px;margin-top: 50px;">Atualize seu app ' + SITENAME + ' para continuar utilizando!<a target="_blank" href="market://details?id=paygas.com.br" class="btn btn-primary py-4 pl-4 pr-4 font-weight-bold" style="position: fixed;bottom: 20px;left: 10%;width: 80%;text-transform: uppercase">atualizar</a></div>'
                            + '<style>.modal-dialog, .modal-body {height: 100vh}.btn-primary[data-dismiss=\'modal\'] {display: none}#core-content {overflow: hidden;height: 100vh}</style>'
                    });
                    setInterval(function () {
                        $("#notificationModal, #notificationModalParent").off();
                        $('[data-dismiss="modal"]').parent().parent().parent().remove();
                    }, 100);
                    window.onpopstate = null;
                }
            }
        }
    }
}

/**
 * Sidebar Functions
 * */
function closeSidebar() {
    $("#app").off("mouseup");
    $("#core-sidebar, #core-overlay").removeClass("active");

    setTimeout(function () {
        $("#core-sidebar").addClass("hide");
        window.onpopstate = maestruHistoryBack;
    }, 150);
}

function openSidebar() {
    let $sidebar = $("#core-sidebar").removeClass("hide");
    $("#core-overlay").addClass("active");

    setTimeout(function () {
        $sidebar.addClass("active");
    }, 50);

    $("#app").on("mouseup", function (e) {
        setTimeout(function () {
            closeSidebar();
        }, 50);
    });

    onHistoryBack(function() {
        closeSidebar();
    });
}

function toggleSidebar(action = 'toggle') {
    if (action === 'toggle') {
        if ($("#core-sidebar").hasClass("hide"))
            openSidebar();
        else
            closeSidebar();
    } else if (action) {
        openSidebar();
    } else {
        closeSidebar()
    }
}

async function logoutDashboard() {
    if (isOnline()) {
        if(confirm("Sair da sua conta?")) {
            AJAX.post("logout").then(async () => {
                toast("Saindo...", 42000);
                await setCookieAnonimo();
                location.href = HOME + (HOME !== SERVER ? "index.html?url=index" : "");
            }).catch(() => {
                toast("Servidor offline! Tente mais tarde...", 42000);
            })
        }
    } else {
        toast("Sem Conexão", 1200)
    }
}

/**
 * Constrói menu de navegação
 */
async function menuConstructor() {

    /**
     * Sidebar
     */
    $("#core-sidebar").htmlTemplate('aside');

    /**
     * Navbar
     * @type {null}
     */
    let $menuNav = null;
    if (($menuNav = $("#core-header-nav-bottom")).length) {
        let $menu = $("#core-menu-custom-bottom").html("");

        let navbar = await dbLocal.exeRead("__navbar", 1);
        if (!isEmpty(navbar)) {
            let tpl = await getTemplates();
            for (let nav of navbar) {
                if (typeof nav.html === "string" && nav.html !== "undefined" && !isEmpty(nav.html))
                    $menu.append(Mustache.render(tpl.menuHeader, nav));
            }
        }

        if ((HOMEPAGE === "0" && navbar.length === 1) || (HOMEPAGE !== "0" && navbar.length === 0)) {
            $menuNav.removeClass('s-show');
        } else {
            $menuNav.addClass('s-show');
            $menu.find("li").css("width", (100 / $menu.find("li").length) + "%")
        }
    }
}

function allowThisType(meta, fields) {
    return (meta.column !== "system_id" || (USER.setor === "admin" && meta.nome !== "")) && meta.format !== "password" && meta.key !== "information" && meta.key !== "identifier" && meta.datagrid !== !1 && !fields.find(s => s.nome === meta.nome);
}

function getFieldsData(entity, haveId, r) {
    let fields = ["", "", "", "", "", "", ""];
    let relevants = r[0];
    let relation = r[1][entity];
    let indices = [];
    if (haveId) {
        let data = {
            'nome': "#",
            'column': 'id',
            'show': !0,
            'class': "",
            'style': "",
            'template': "",
            'format': "number",
            'relation': null,
            'first': !0
        };
        pushToArrayIndex(fields, data, 0);
        indices.push(0)
    }

    function getIndiceField(indice, indices) {
        if (indices.indexOf(indice) > -1)
            return getIndiceField((indice + 1), indices);
        return indice
    }

    $.each(dicionarios[entity], function (i, e) {
        if (!isEmpty(e.datagrid) && !isEmpty(e.datagrid.grid_relevant)) {
            let data = {
                'nome': e.nome,
                'column': e.column,
                'show': !0,
                'class': e.datagrid.grid_class || "",
                'style': e.datagrid.grid_style || "",
                'template': e.datagrid.grid_template || "",
                'format': e.format,
                'relation': e.relation || null,
                'first': !haveId && e.datagrid.grid_relevant === 1
            };
            let indice = getIndiceField(e.datagrid.grid_relevant - 1, indices);
            indices.push(indice);
            pushToArrayIndex(fields, data, indice);
        }
    });

    if (!isEmpty(relation) && typeof relation === "object" && !isEmpty(relation.belongsTo)) {
        $.each(relation.belongsTo, function (i, e) {
            $.each(e, function (relEntity, relData) {
                if (!isEmpty(relData.datagrid) && isEmpty(fields[relData.datagrid - 1])) {
                    let data = {
                        'nome': ucFirst(replaceAll(replaceAll(relEntity, "_", " "), "-", " ")),
                        'column': relData.column,
                        'show': !0,
                        'class': relData.grid_class_relational || "",
                        'style': relData.grid_style_relational || "",
                        'template': relData.grid_template_relational || "",
                        'format': 'text',
                        'relation': relEntity,
                        'first': !haveId && relData.datagrid === 1
                    };
                    let indice = getIndiceField(relData.datagrid - 1, indices);
                    indices.push(indice);
                    pushToArrayIndex(fields, data, indice)
                }
            })
        })
    }

    if (!isEmpty(relevants)) {
        for (let a = 0; a < 6; a++) {
            if (isEmpty(fields[a])) {
                $.each(dicionarios[entity], function (i, e) {
                    if (allowThisType(e, fields)) {
                        let data = {
                            'nome': e.nome,
                            'column': e.column,
                            'show': e.datagrid !== !1 && relevants.indexOf(e.format) > -1,
                            'class': e.datagrid.grid_class || "",
                            'style': e.datagrid.grid_style || "",
                            'template': e.datagrid.grid_template || "",
                            'format': e.format,
                            'relation': e.relation || null,
                            'first': !haveId && a === 0
                        };
                        let indice = getIndiceField(a, indices);
                        if (indice < 7) {
                            indices.push(indice);
                            pushToArrayIndex(fields, data, indice)
                        }
                    }
                })
            }
        }
    }

    /**
     * Preenche campos restantes para disponibilizar visualização por controle na tabela
     */
    $.each(dicionarios[entity], function (i, e) {
        if (allowThisType(e, fields)) {
            let data = {
                'nome': e.nome,
                'column': e.column,
                'show': !1,
                'class': e.datagrid.grid_class || "",
                'style': e.datagrid.grid_style || "",
                'template': e.datagrid.grid_template || "",
                'format': e.format,
                'relation': e.relation || null,
                'first': !1
            };
            let indice = getIndiceField(0, indices);
            indices.push(indice);
            pushToArrayIndex(fields, data, indice)
        }
    })

    return fields.filter(function (data) {
        if (!isEmpty(data))
            return data
    })
}

function maskData($data) {
    let SP = {
        tel: val => {
            return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : (val.replace(/\D/g, '').length < 3 ? '' : '(00) 0000-00009')
        }, ie: val => {
            return val.replace(/\D/g, '').length > 0 ? '000.000.000.000' : ''
        }, cpf: val => {
            return val.replace(/\D/g, '').length > 0 ? '000.000.000-00' : ''
        }, cnpj: val => {
            return val.replace(/\D/g, '').length > 0 ? '00.000.000/0000-00' : ''
        }, cep: val => {
            return val.replace(/\D/g, '').length > 0 ? '00000-000' : ''
        }, datetime: val => {
            return val.length > 0 ? '00/00/0000 00:00:00' : ''
        }, percent: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : ((v === 2 ? '00' : (v === 1 ? '0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1)) + ',00')) + "%")
        }, valor: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : "R$ " + (v === 2 ? '00,\0\0' : (v === 1 ? '0,\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1), '.') + ',00'))
        }, valor_decimal: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : "R$ " + (v === 2 ? '00,\0\0' : (v === 1 ? '0,\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1), '.') + ',000'))
        }, valor_decimal_plus: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : "R$ " + (v === 2 ? '00,\0\0' : (v === 1 ? '0,\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1), '.') + ',0000'))
        }, valor_decimal_minus: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : "R$ " + (v === 2 ? '00,\0\0' : (v === 1 ? '0,\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1), '.') + ',0'))
        }, valor_decimal_none: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : "R$ " + (v === 2 ? '00,\0\0' : (v === 1 ? '0,\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1), '.')))
        }, cardnumber: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : (v === 8 ? '0000 0000' : v === 12 ? '0000 0000 0000' : v === 16 ? '0000 0000 0000 0000' : '0000 0000 0000 0000 0000')
        }, float: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : (v === 2 ? '00.\0\0' : (v === 1 ? '0.\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1)) + '.00'))
        },
    };

    if ($data.find(".td-tel").find(".td-value").length)
        $data.find(".td-tel").find(".td-value").mask(SP.tel);
    if ($data.find(".td-ie").find(".td-value").length)
        $data.find(".td-ie").find(".td-value").mask(SP.ie);
    if ($data.find(".td-cpf").find(".td-value").length)
        $data.find(".td-cpf").find(".td-value").mask(SP.cpf);
    if ($data.find(".td-cnpj").find(".td-value").length)
        $data.find(".td-cnpj").find(".td-value").mask(SP.cnpj);
    if ($data.find(".td-cep").find(".td-value").length)
        $data.find(".td-cep").find(".td-value").mask(SP.cep);
    if ($data.find(".td-percent").find(".td-value").length)
        $data.find('.td-percent').find(".td-value").mask(SP.percent);
    if ($data.find(".td-valor").find(".td-value").length)
        $data.find(".td-valor").find(".td-value").mask(SP.valor);
    if ($data.find(".td-valor-decimal").find(".td-value").length)
        $data.find(".td-valor-decimal").find(".td-value").mask(SP.valor_decimal);
    if ($data.find(".td-valor-decimal-plus").find(".td-value").length)
        $data.find(".td-valor-decimal-plus").find(".td-value").mask(SP.valor_decimal_plus);
    if ($data.find(".td-valor-decimal-minus").find(".td-value").length)
        $data.find(".td-valor-decimal-minus").find(".td-value").mask(SP.valor_decimal_minus);
    if ($data.find(".td-valor-decimal-none").find(".td-value").length)
        $data.find(".td-valor-decimal-none").find(".td-value").mask(SP.valor_decimal_none);
    if ($data.find(".td-datetime").find(".td-value").length)
        $data.find('.td-datetime').find(".td-value").mask(SP.datetime);
    if ($data.find(".td-card_number").find(".td-value").length)
        $data.find('.td-card_number').find(".td-value").mask(SP.cardnumber);
    if ($data.find(".td-float").find(".td-value").length)
        $data.find(".td-float").find(".td-value").mask(SP.float);

    return $data
}

async function getFields(entity, haveId, type) {
    if (isOnline() && typeof type === "string") {
        let rec = await AJAX.get("event/recoveryFieldsCustom/" + type + "/" + entity);
        if (!isEmpty(rec)) {
            for (let r of rec) {
                r.show = r.show === "true";
                r.first = r.first === "true"
            }
            return rec
        }
    }

    haveId = haveId || !1;

    let relevants = await dbLocal.exeRead("__relevant", 1);
    let relation = await dbLocal.exeRead("__general", 1);
    let info = await dbLocal.exeRead("__info", 1);

    return getFieldsData(entity, haveId, [relevants, relation, info])
}

function getRelevantTitle(entity, data, limit, etiqueta) {
    if (typeof data !== "undefined" && data !== null) {
        limit = limit || 1;
        etiqueta = typeof etiqueta === "boolean" ? etiqueta : !0;
        let field = "<div>";
        let count = 0;
        let pp = [];
        return getFields(entity).then(fields => {
            if (!isEmpty(fields)) {
                $.each(fields, function (i, e) {
                    if (count < limit && typeof data[e.column] !== "undefined" && data[e.column] !== null) {
                        if (e.format === "list") {
                            pp.push(db.exeRead(e.relation, parseInt(data[e.column])).then(d => {
                                return getRelevantTitle(e.relation, (!isEmpty(d) ? d[0] : null), 1, etiqueta).then(ff => {
                                    field += ff
                                })
                            }))
                        } else {
                            field += (etiqueta ? "<small class='color-gray left opacity padding-tiny radius'>" + e.nome.toLowerCase() + "</small>" : "") + "<span style='padding: 1px 5px' class='left padding-right font-medium td-" + e.format + "'> " + data[e.column] + "</span>"
                        }
                        count++
                    }
                })
            }
            return Promise.all(pp).then(() => {
                field += "</div>";
                field = maskData($(field)).html();
                return field
            })
        })
    } else {
        return new Promise((s, f) => {
            return s("")
        })
    }
}

function loadSyncNotSaved() {
    if (USER.setor === 0)
        return;

    return AJAX.get('load/sync').then(sync => {
        if (typeof sync === "object") {
            $.each(sync, function (entity, registros) {
                dbLocal.newKey(entity).then(key => {
                    $.each(registros, function (i, reg) {
                        let d = Object.assign({}, reg);
                        d.id = (d.db_action === "create" ? key++ : parseInt(d.id));
                        delete d.id_old;
                        delete d.db_error;
                        delete d.db_errorback;
                        dbLocal.insert(entity, d, d.id);
                        dbLocal.insert("sync_" + entity, d, d.id);
                    });
                })
            });
        }
    });
}

async function clearCacheUser() {
    localStorage.removeItem("accesscount");

    /**
     * Stop SSE events
     */
    sse.close();

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    let syncData = await dbLocal.exeRead("_syncDB");
    if (!isEmpty(syncData))
        await AJAX.post("up/sync", syncData).catch(() => {});

    /**
     * Clear history user on server
     * Clear all indexedDB
     */
    await AJAX.post("clearUserHistory").catch(() => {});
    if(!isEmpty(dicionarios)) {
        for (let entity of Object.keys(dicionarios))
            dbLocal.clear(entity);
    }

    return clearIndexedDbGets().then(() => {
        if (SERVICEWORKER) {

            /**
             * Clear cache pages
             */
            return caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => {
                    let corte = cacheName.split("-v");
                    if (corte[1] !== VERSION || ["user-view", "user-view-css", "user-view-js"].indexOf(corte[0]) > -1)
                        caches.delete(cacheName);
                }))
            })
        }
    })
}

async function clearCacheAll() {
    localStorage.removeItem('update');
    localStorage.removeItem('accesscount');

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    let syncData = await dbLocal.exeRead("_syncDB");
    if (!isEmpty(syncData))
        await AJAX.post("up/sync", syncData).catch(() => {});

    /**
     * Clear all cache for this user
     */
    if(localStorage.cachedGet) {
        for(let n of JSON.parse(localStorage.cachedGet))
            await dbLocal.clear(n);
    }

    /**
     * Clear history user on server
     * Clear indexedDB
     */
    await AJAX.post("clearUserHistory").catch(() => {});
    if(!isEmpty(dicionarios)) {
        for (let entity of Object.keys(dicionarios))
            dbLocal.clear(entity);
    }

    return clearIndexedDbGets().then(() => {
        if (!SERVICEWORKER)
            return Promise.all([]);

        return caches.keys().then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                return caches.delete(cacheName);
            }))
        }).then(() => {

            return navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations)
                    registration.unregister();
            });
        });
    })
}

function updateCache() {
    if (isOnline()) {
        toast("Atualizando Aplicativo", 7000, "toast-success");
        clearCacheAll().then(() => {
            location.reload();
        })
    } else {
        toast("Sem Conexão", 1200);
    }
}

function recoveryUser() {
    return dbLocal.exeRead("__login", 1).then(login => {
        if (login.token != localStorage.token)
            return setCookieAnonimo();

        login.id = login.idUserReal;
        delete login.idUserReal;
        return setUserInNavigator(login, 1);

    }).catch(e => {
        errorLoadingApp("recuperar usuário", e);
    });
}

async function setUserInNavigator(user, isUserToStore) {
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
    localStorage.token = user.token;

    /**
     * Clear all cache for this user
     */
    if(localStorage.cachedGet) {
        for(let n of JSON.parse(localStorage.cachedGet))
            await dbLocal.clear(n);
    }

    if (typeof isUserToStore === "undefined") {
        return storeUser().then(loadCacheUser).catch(e => {
            errorLoadingApp("obter __login", e);
        });
    } else {
        let tpl = await getTemplates();
        if(typeof tpl.header === "undefined")
            await loadCacheUser();
        else
            dicionarios = await dbLocal.exeRead("__dicionario", 1);
    }
}

function setCookieAnonimo() {
    let token = Date.now() + Math.floor((Math.random() * 100000) + 1);
    return setCookieUser({token: "T!" + token, id: (token * -1), nome: 'Anônimo', imagem: '', setor: 0});
}

function setCookieUser(user) {
    /**
     * Limpa dados de usuário
     * */
    return clearCacheUser().then(() => {

        /**
         * Seta usuário
         * */
        return setUserInNavigator(user);
    });
}

async function checkSessao() {
    /**
     * Verifica Sessão
     * */
    if (!localStorage.token) {
        /**
         * Ainda não existe sessão, começa como anônimo
         */
        return setCookieAnonimo();

    } else {
        /**
         * read user in indexedDb
         */
        return recoveryUser();
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
    if (isOnline()) {
        return clearCacheUser().then(() => {
            return loadCacheUser();
        });
    }
}

async function loadViews() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    return AJAX.get("appFilesView").then(g => {
        return caches.open('user-view-v' + VERSION).then(cache => {

            /**
             * Cache views
             */

            //check if have json file in bundle mode
            if(window.hasOwnProperty("cordova") && HOME !== SERVER)
                return cache.addAll(g.view.map(s => "view/" + USER.setor + "/" + s + ".json"));

            return cache.addAll(g.view.map(s => "view/" + s + "/maestruToken/" + USER.token));

        }).then(() => {

            /**
             * Para cada view, carrega seus assets
             */
            let viewsAssets = [];
            if (!isEmpty(g.view)) {
                for (let i in g.view) {
                    let viewName = "assetsPublic/view/" + USER.setor + "/" + g.view[i];
                    viewsAssets.push(viewName + ".min.js?v=" + VERSION);
                }
            }

            /**
             * Cache view Assets
             */
            return caches.open('user-view-js-v' + VERSION).then(cache => {
                return cache.addAll(viewsAssets);
            });
        }).catch(e => {
            errorLoadingApp("create cache view", e);
        })
    }).catch(e => {
        errorLoadingApp("appFilesView", e);
    });
}

function loadUserViews() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    return AJAX.get("appFilesViewUser").then(g => {
        return caches.open('user-view-v' + VERSION).then(cache => {

            /**
             * Cache views and then Js
             */
            return cache.addAll(g.view.map(s => "view/" + s + "/maestruToken/" + USER.token)).then(() => {

                /**
                 * Para cada view, carrega seus assets
                 */
                let viewsAssets = [];
                if (!isEmpty(g.view)) {
                    for (let i in g.view)
                        viewsAssets.push("assetsPublic/view/" + USER.setor + "/" + g.view[i] + ".min.js?v=" + VERSION);
                }

                return caches.open('user-view-js-v' + VERSION).then(c => {
                    return c.addAll(viewsAssets);
                });
            });
        })
    });
}

function loadCacheUser() {
    /**
     * Load User Data content
     * */
    return getIndexedDbGets().catch(e => {
        errorLoadingApp("loadCacheUser", e);
    });
}

function updateGraficos() {
    return dbLocal.clear('__graficos').then(() => {
        return AJAX.get("graficos").then(r => {
            return dbLocal.exeCreate('__graficos', r);
        });
    });
}

function getGraficos() {
    return dbLocal.exeRead("__graficos", 1);
}

async function getTemplates() {
    return dbLocal.exeRead("__template", 1);
}

function getNotche(side) {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sa" + side.substring(0, 1)));
}

function isOnline() {
    if(typeof Connection !== "undefined" && typeof navigator.connection !== "undefined" && typeof navigator.connection.type !== "undefined") {
        return navigator.connection.type !== Connection.NONE;
    } else {
        return navigator.onLine;
    }
}

function errorLoadingApp(id, e) {
    console.log(e);
    toast((isOnline()? "" : "[offline] " ) + "Erro ao carregar Aplicativo [" + id + "]", 3000, "toast-warning");
}

async function firstAccess() {
    localStorage.accesscount = 1;
    await cacheCoreApp();
    return loadViews();
}

async function cacheCoreApp() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    /**
     * Load and store index app cache first time only
     * */
    await caches.open('index-v' + VERSION).then(cache => {
        fetch("index.html").then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                cache.put("index", networkResponse.clone());
            } else {
                fetch("index").then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic')
                        cache.put("index", networkResponse.clone());
                });
            }
        });
    });

    return AJAX.get("currentFiles").then(async g => {
        for(let cacheControl in g) {
            await caches.open(cacheControl + '-v' + VERSION).then(cache => {
                return cache.addAll(g[cacheControl]).catch(e => {
                    errorLoadingApp("Cache Storage Initial: " + cacheControl, e);
                })
            })
        }
    })
}

async function clearIndexedDbGets() {
    await dbLocal.clear('__historic');
    await dbLocal.clear('__allow');
    await dbLocal.clear('__dicionario');
    await dbLocal.clear('__info');
    await dbLocal.clear('__menu');
    await dbLocal.clear('__template');
    await dbLocal.clear('__navbar');
    await dbLocal.clear('__react');
    await dbLocal.clear('__relevant');
    await dbLocal.clear('__general');
    return dbLocal.clear('__totalRegisters');
}

async function getIndexedDbGets() {
    let r = await AJAX.get("userCache");

    dicionarios = r['dicionario'];
    if (USER.setor === "admin") {
        let inputTypes = await get("inputTypes");
        for (let entity in dicionarios) {
            let infoDic = r['info'][entity];
            if (infoDic.system !== "" && infoDic.user === 1) {
                dicionarios[entity].system_id = Object.assign({}, inputTypes.list, {
                    id: infoDic.identifier,
                    position: 0,
                    indice: infoDic.identifier,
                    column: "system_id",
                    nome: ucFirst(infoDic.system || ""),
                    relation: infoDic.system
                });
            }
        }
    }

    await dbLocal.exeCreate('__allow', r['allow']);
    await dbLocal.exeCreate('__dicionario', dicionarios);
    await dbLocal.exeCreate('__info', r['info']);
    await dbLocal.exeCreate('__template', r['template']);
    await dbLocal.exeCreate('__menu', r['menu']);
    await dbLocal.exeCreate('__navbar', r['navbar']);
    await dbLocal.exeCreate('__react', r['react']);
    await dbLocal.exeCreate('__relevant', r['relevant']);
    await dbLocal.exeCreate('__general', r['general']);
    await dbLocal.exeCreate('__graficos', r['graficos']);
}

/**
 * Se estiver em Dev, atualiza dados
 */
function updateAppOnDev() {
    if (!isOnline() || !DEV)
        return Promise.all([]);

    /**
     * Limpa cache information
     */
    return clearIndexedDbGets().then(() => {
        if (SERVICEWORKER) {

            /**
             * Clear cache pages
             */
            return caches.keys().then(cacheNames => {
                return Promise.all(cacheNames.map(cacheName => {
                    let corte = cacheName.split("-");
                    if (corte[1] !== VERSION || ["user-view", "user-view-css", "user-view-js"].indexOf(corte[0]) > -1)
                        return caches.delete(cacheName);
                }))
            })
        }

    }).then(() => {

        return cacheCoreApp();

    }).then(() => {
        return getIndexedDbGets().then(() => {
            /**
             * Carrega as views para este usuário
             */
            return loadUserViews();
        });
    });
}

async function thenAccess() {
    /**
     * Conta acesso
     */
    localStorage.accesscount = parseInt(localStorage.accesscount) + 1;
}

function checkMenuActive() {
    $(".menu-li").removeClass("active").each(function (i, e) {
        if ($(e).attr("rel") === app.file || $(e).find("[rel='" + app.file + "']").length || $(e).find("a[href='" + app.file + "']").length)
            $(e).addClass("active");
    });
}

function checkFormNotSaved() {
    if (typeof form === "object" && typeof checkformSaved !== "undefined" && !checkformSaved && !isEmpty(form) && !form.saved && !confirm("Alterações não salvas. Sair mesmo assim?"))
        return !1

    if(typeof checkformSaved !== "undefined")
        checkformSaved = !0;

    return !0
}

function clearPage() {
    if(typeof forms !== "undefined")
        forms = [];
    if(typeof grids !== "undefined")
        grids = [];

    closeSidebar();
}

function getPageContentHeight() {
    let heightHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header").children().first()[0].clientHeight : 0;
    if(heightHeader > 0)
        return "calc(100vh - " + (heightHeader) + "px)"

    return "100vh";
}

function getPaddingTopContent() {
    if (!$("#core-header").hasClass("core-show-header-navbar") && window.innerWidth < 993)
        return getNotche("top");

    return 0;
}

function defaultPageTransitionPosition(direction, $element, route) {
    aniTransitionPage = $element;
    let topHeader = $("#core-header").css("opacity") !== "0" && typeof $("#core-header").children().first()[0] !== "undefined" ? $("#core-header").children().first()[0].clientHeight : 0;
    let left = $element[0].getBoundingClientRect().left;
    let paddingLeft = parseInt($element.css("padding-left"));
    let paddingRight = parseInt($element.css("padding-right"));
    let style = {
        "min-height": getPageContentHeight(),
        "position": "fixed",
        "top": 0,
        "left": left + "px",
        "width": $element[0].clientWidth + "px",
        "padding-left": paddingLeft + "px",
        "padding-right": paddingRight + "px",
        "overflow": "hidden"
    };

    $element.css({"margin-top": ($element[0].getBoundingClientRect().top < 0 ? $element[0].getBoundingClientRect().top : 0), "padding-top": parseInt($element.css("padding-top")) + $element[0].getBoundingClientRect().top + "px"}).css(style);

    let file = app.file.split("/")[0];
    let $aux = null;

    if ($(".cache-content[rel='" + route + "']").length) {
        $aux = $(".cache-content[rel='" + route + "']").removeClass("hide").css({"top": topHeader + "px"});
    } else {
        $aux = $("<section />").css(style).css("top", "env(safe-area-inset-top)").addClass("core-class-container r-network r-403 r-" + file).data("file", file).insertBefore($element);
    }

    if (direction === 'fade') {
        $aux.animate({opacity: 0}, 0);
        $element.animate({opacity: 1}, 0)
    } else {
        $aux.css("display", "none");
    }

    return $aux
}

async function animateTimeout($element, $aux, scroll, backup) {
    $aux.removeClass("pageAnimateFoward pageAnimateBack").attr("id", $element.attr('id')).css({
        "position": "relative",
        "top": "initial",
        "left": "initial",
        "width": "100%"
    });

    if(typeof backup[0] !== "undefined" && backup[0] !== "0px")
        $aux.css("margin-top", backup[0]);

    if(typeof backup[1] !== "undefined")
        $aux.css("padding-top", backup[1]);

    if ($element.hasClass("cache-content")) {
        /**
         * Cria Page Cache
         */
        $aux.removeAttr("data-header").removeAttr("data-head").removeAttr("data-navbar").removeAttr("data-js").removeAttr("data-title").removeAttr("rel").removeClass("cache-content");
        $element.addClass("hide");
        if ($element.attr("id") !== undefined)
            $element.attr("id", "cache-" + $element.attr("id"));

    } else {
        $element.remove();
    }

    //add or not space on end content (navbar space)
    if (window.innerWidth < 900 && $("#core-header-nav-bottom").hasClass("core-show-navbar"))
        $("#core-content").addClass("pb-navbar");
    else
        $("#core-content").removeClass("pb-navbar");

    aniTransitionPage = null;
    window.scrollTo(0, scroll);
}

async function animateForward($element, $aux, style, backup, scroll) {
    if(typeof backup[0] !== "undefined" && backup[0] !== "0px")
        style["margin-top"] = 0;

    $aux.addClass("pageAnimateFoward").css(style);
    $element.addClass("pageAnimateFowardMinus");
    setTimeout(function() {
        animateTimeout($element, $aux, scroll, backup)
    }, 250);
}

async function animateBack($element, $aux, style, backup, scroll) {
    if(typeof backup[0] !== "undefined" && backup[0] !== "0px")
        style["margin-top"] = 0;

    $aux.addClass("pageAnimateBack").css(style);
    $element.addClass("pageAnimateBackMinus");
    setTimeout(function() {
        animateTimeout($element, $aux, scroll, backup)
    }, 250);
}

async function animateFade($element, $aux, style, backup, scroll) {
    $element.animate({opacity: 0}, 150);
    $aux.animate({left: 0}, 0).animate({opacity: 1}, 200, () => {
        animateTimeout($element, $aux, scroll, backup)
    });
}

async function animateNone($element, $aux, style, backup, scroll) {
    $element.animate({opacity: 0}, 0);
    $aux.animate({left: 0, opacity: 1}, 0);
    animateTimeout($element, $aux, scroll, backup);
}

async function headerShow(show) {
    if (show)
        $("#core-header").addClass("core-show-header-navbar");
    else
        $("#core-header").removeClass("core-show-header-navbar");
}

var dicionarios,
    aniTransitionPage = null,
    historyPosition = 1,
    historyReqPosition = 0,
    loadingEffect = null,
    deferredPrompt,
    timeWaitClick = 0;

/**
 * Update data-get with the dados
 * @param get
 * @param dados
 * @returns {Promise<void>}
 */
async function renderDataGet(get, dados) {
    if (typeof sse.baseViewData[app.file] !== "object")
        return;

    /**
     * First, find by the variables used
     */
    sse.baseViewData[app.file].dom.find("[data-realtime-get]").each(async function (i, e) {
        let tGet = $(e).attr("data-get");
        if(isEmpty(tGet) || tGet !== get)
            return;

        let $t = $("<div>" + sse.baseViewData[app.file].template + "</div>").find("[data-realtime-get]").eq(i);
        if($t.length) {

            /**
             * get the data to use on template if need
             */
            if ($(e).hasAttr("data-get-function") && $(e).data("get-function") !== "" && typeof window[$(e).data("get-function")] === "function")
                dados = await window[$(e).data("get-function")](dados);
            else if ($(e).hasAttr("data-function") && $(e).data("function") !== "" && typeof window[$(e).data("function")] === "function")
                dados = await window[$(e).data("function")](dados);
            else if ($(e).data("realtime-get") !== "" && typeof window[$(e).data("realtime-get")] === "function")
                dados = await window[$(e).data("realtime-get")](dados);

            let $templateChild = $t;
            let parametros = {};

            if (isEmpty(dados) && $(e).hasAttr("data-template-empty")) {
                parametros = ($(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                $templateChild = $("<div>" + (await getTemplates())[Mustache.render($(e).data("template-empty"), param)] + "</div>");
            } else {
                parametros = (isEmpty(dados) && $(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                if ($(e).hasAttr("data-template"))
                    $templateChild = $("<div>" + (await getTemplates())[Mustache.render($(e).data("template"), param)] + "</div>");
            }

            if ($(e).hasAttr("data-param-function") && $(e).data("param-function") !== "" && typeof window[$(e).data("param-function")] === "function")
                parametros = await window[$(e).data("param-function")](parametros);

            if (!isEmpty(parametros) && typeof parametros === "object") {
                if (!isEmpty(dados))
                    mergeObject(dados, parametros);
                else
                    dados = parametros;
            }

            if ($(e).hasAttr("data-template-empty"))
                await $(e).htmlTemplate($templateChild.html(), dados);
            else
                await _updateTemplateRealTime($(e), $templateChild, dados);
        }
    });
}

/**
 *
 * @param $element
 * @param $template
 * @param param
 * @private
 */
async function _updateTemplateRealTime($element, $template, param) {
    if (typeof sse.baseViewData[app.file] !== "object")
        return;

    param = _htmlTemplateDefaultParam(!1, param);

    if(typeof $element === "undefined")
        $element = sse.baseViewData[app.file].dom;

    if(typeof $template === "undefined")
        $template = $("<div>" + sse.baseViewData[app.file].template + "</div>");

    let $elementIsolated = $("<div>" + $element.html() + "</div>");

    /**
     * Render all tags
     */
    $element.find("[data-realtime]").each(async function (i, e) {
        let $iso = $elementIsolated.find("[data-realtime]").eq(i);
        if(!$iso.closest("[data-db]").length && !$iso.closest("[data-get]").length) {
            let $t = $template.find("[data-realtime]").eq(i);
            if ($t.length) {

                /**
                 * Update the html
                 */
                let html = Mustache.render($t.html(), param);
                let funcao = $(e).data("realtime");
                if (funcao !== "" && typeof window[funcao] === "function")
                    html = await window[funcao](html);

                $(e).html(html);

                /**
                 * Update all attributes of element
                 */
                $.each($t[0].attributes, async function () {
                    if (this.specified) {
                        let txtc = document.createElement("textarea");
                        txtc.innerHTML = Mustache.render(this.value, param);
                        let valor = txtc.value

                        if ($(e).hasAttr("data-realtime-" + this.name) && typeof window[$(e).data("realtime-" + this.name)] === "function")
                            valor = await window[$(e).data("realtime-" + this.name)](valor);

                        $(e).removeAttr(this.name).attr(this.name, valor);
                    }
                });
            }
        }
    });

    /**
     * Render html realtime only
     */
    $element.find("[data-realtime-html]").each(async function (i, e) {
        let $iso = $elementIsolated.find("[data-realtime-html]").eq(i);
        if(!$iso.closest("[data-db]").length && !$iso.closest("[data-get]").length) {
            let $t = $template.find("[data-realtime-html]").eq(i);
            if ($t.length) {
                let html = Mustache.render($t.html(), param);
                let funcao = $(e).data("realtime-html");
                if (funcao !== "" && typeof window[funcao] === "function")
                    html = await window[funcao](html);

                $(e).html(html);
            }
        }
    });

    /**
     * Render all attributes realtime only
     */
    $element.find("[data-realtime-attr]").each(function (i, e) {
        let $iso = $elementIsolated.find("[data-realtime-attr]").eq(i);
        if(!$iso.closest("[data-db]").length && !$iso.closest("[data-get]").length) {
            let $t = $template.find("[data-realtime-attr]").eq(i);
            if ($t.length) {
                $.each($t[0].attributes, async function () {
                    if (this.specified) {
                        let txtc = document.createElement("textarea");
                        txtc.innerHTML = Mustache.render(this.value, param);
                        let valor = txtc.value;

                        if ($(e).hasAttr("data-realtime-" + this.name) && typeof window[$(e).data("realtime-" + this.name)] === "function")
                            valor = await window[$(e).data("realtime-" + this.name)](valor);

                        $(e).removeAttr(this.name).attr(this.name, valor);
                    }
                });
            }
        }
    });
}

/**
 * Check for render DB data again
 */
async function _checkRealtimeDbUpdate(entity) {
    return new Promise(s => {
        if(typeof sse.baseViewData[app.file] === "object") {
            let dbFind = "[data-db='" + entity + "'][data-realtime-db]";
            $("<div>" + sse.baseViewData[app.file].template + "</div>").find(dbFind).each(async function (i, e) {
                let $tag = sse.baseViewData[app.file].dom.find(dbFind).eq(i);

                /**
                 * get the data to use on template if need
                 */
                let dados = await $tag.dbExeRead();
                let dadosBase64 = btoa(JSON.stringify(dados));
                let dadosActual = localStorage.getItem('lastDataFromDBCache-' + entity);
                if(!dadosActual || dadosActual !== dadosBase64) {
                    localStorage.setItem('lastDataFromDBCache-' + entity, dadosBase64);

                    if ($(e).hasAttr("data-db-function") && $(e).data("db-function") !== "" && typeof window[$(e).data("db-function")] === "function")
                        dados = await window[$(e).data("db-function")](dados);
                    else if ($(e).hasAttr("data-function") && $(e).data("function") !== "" && typeof window[$(e).data("function")] === "function")
                        dados = await window[$(e).data("function")](dados);
                    else if ($tag.data("realtime-db") !== "" && typeof window[$tag.data("realtime-db")] === "function")
                        dados = await window[$tag.data("realtime-db")](dados);

                    let $templateChild = $(e);
                    let parametros = {};

                    if (isEmpty(dados) && $(e).hasAttr("data-template-empty")) {
                        parametros = ($(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                        $templateChild = $("<div>" + (await getTemplates())[$(e).data("template-empty")] + "</div>");
                    } else {
                        parametros = (isEmpty(dados) && $(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                        if ($(e).hasAttr("data-template"))
                            $templateChild = $("<div>" + (await getTemplates())[$(e).data("template-empty")] + "</div>");
                    }

                    if ($(e).hasAttr("data-param-function") && $(e).data("param-function") !== "" && typeof window[$(e).data("param-function")] === "function")
                        parametros = await window[$(e).data("param-function")](parametros);

                    if (!isEmpty(parametros) && typeof parametros === "object") {
                        if (!isEmpty(dados))
                            mergeObject(dados, parametros);
                        else
                            dados = parametros;
                    }

                    if ($tag.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
                        await $tag.htmlTemplate($templateChild.html(), dados);
                    else
                        await _updateTemplateRealTime($tag, $templateChild, dados);
                }

                s(1);
            });
        }
    })
}

/**
 * app global de navegação do app
 * */
var PARAM, app = {
    file: "",
    route: "",
    title: "",
    loading: !1,
    loadingScripts: !1,
    removeLoading: function () {
        app.loading = !1;
        $("#core-loader").css("display", "none");
        clearInterval(loadingEffect);
    }, setLoading: function () {
        app.loading = !0;
        $("#core-loader").css("display", "block");

        loadingEffect = setInterval(function () {
            $("#core-header").loading();
        }, 1900);
    }, applyView: async function (file, $div) {
        $div = typeof $div === "undefined" ? $("#core-content") : $div;
        let resultSSEget = await AJAX.post('setUserLastView', {"v": app.file}).catch(() => {})

        /**
         * Update the cache get if have before load view
         */
        if(!isEmpty(resultSSEget)) {
            for(let cacheName in resultSSEget)
                dbLocal.exeCreate("_cache_get_" + cacheName, {id: 1, result: JSON.stringify(resultSSEget[cacheName].data)});
        }

        let g = await AJAX.view(file);
        if (g) {
            if (file === "403" || app.haveAccessPermission(g.setor, g["!setor"])) {
                TITLE = app.title = g.title;
                headerShow(g.header);
                checkMenuActive();
                $("#core-title").text(g.title);

                /**
                 * add tags to the head of the page
                 * if allready exist, so not do anything
                 */
                let $html = $("html");
                let isDark = $html.hasClass("darkmode");
                $html.removeClass();
                if(isDark)
                    $html.addClass("darkmode");

                if (!isEmpty(g.head)) {
                    /**
                     * Add link to head
                     */
                    for (let hid in g.head) {
                        if (/^core-/.test(hid))
                            $html.addClass(hid);
                        else
                            $div.addClass(hid);

                        if (!$("head > #" + hid).length)
                            $(g.head[hid]).appendTo("head");
                    }
                }

                let templates = await getTemplates();

                /**
                 * Include templates used in this view
                 */
                if (!isEmpty(g.templates)) {
                    templates = Object.assign(templates, g.templates);
                    dbLocal.exeCreate("__template", templates);
                }

                /**
                 * Pre scripts
                 */
                if (!isEmpty(g.jsPre)) {
                    for (let js of g.jsPre) {
                        if(window.hasOwnProperty("cordova"))
                            js = js.replace(HOME, "").replace("?v=" + VERSION, "");

                        await $.cachedScript(js);
                    }
                }

                let htmlTemplate = "<style class='core-style'>" + g.css + "#core-content {margin-top:" + (g.header ? $("#core-header").children().first()[0].clientHeight : 0) + "px;padding-top:" + getPaddingTopContent() + "px}" + "</style>" + g.content;
                await $div.htmlTemplate(htmlTemplate);

                if (g.cache)
                    $div.addClass("cache-content").attr("rel", file).attr("data-title", g.title).attr("data-header", g.header).attr("data-navbar", g.navbar).attr("data-js", g.js).attr("data-head", JSON.stringify(g.head));

                if (g.navbar)
                    $("#core-header-nav-bottom").addClass("core-show-navbar");
                else
                    $("#core-header-nav-bottom").removeClass("core-show-navbar");

                $div.css("min-height", getPageContentHeight());
                if ($div.attr("id") === "core-content")
                    $div.css("padding-top", getPaddingTopContent());

                /**
                 * add script to page
                 */
                if (!isEmpty(g.js)) {
                    app.loadingScripts = !0;
                    setTimeout(async function () {
                        for (let js of g.js) {
                            if(window.hasOwnProperty("cordova"))
                                js = js.replace(HOME, "").replace("?v=" + VERSION, "");

                            await $.cachedScript(js);
                        }

                        app.loadingScripts = !1;
                    },1);
                }

                /**
                 * Register SSE
                 */
                if (isOnline() && typeof (EventSource) !== "undefined")
                    sse.baseViewData[file] = {"dom": $div, "template": htmlTemplate};

                return Promise.all([]);

            } else {
                if (USER.setor === 0 && !localStorage.redirectOnLogin)
                    localStorage.redirectOnLogin = file;

                location.href = HOME + (HOME !== SERVER ? "index.html?url=" : "") + g.redirect
            }
        } else {
            $div.html("");
            return Promise.all([]);
        }
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
var awaitingTransition = false;

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
async function pageTransition(route, type, animation, target, param, scroll, setHistory, replaceHistory) {

    if(awaitingTransition)
        return;

    awaitingTransition = app.loading || aniTransitionPage;

    while(app.loading || aniTransitionPage)
        await sleep(10);

    awaitingTransition = false;

    localStorage.navigationCount ++;
    let reload = typeof route === "undefined";
    let isGridView = typeof history.state !== "undefined" && history.state !== null && typeof history.state.type === "string" && history.state.type === "grid";
    param = (typeof param === "object" && param !== null && param.constructor === Object ? param : {});
    param.url = (typeof param.url === "undefined" ? [] : param.url);

    if (reload && HOME === "" && HOME !== SERVER) {
        route = "index";
    } else {
        route = (typeof route === "string" ? route : location.href).replace(HOME, '');
        route = route === "/" ? "" : route;
        if (HOME === "" && HOME !== SERVER && /index\.html\?url=/.test(route))
            route = route.split("?url=")[1];

        if (/\//.test(route)) {
            param.url = route.split("/");
            if (HOME === "" && HOME !== SERVER)
                route = param.url.shift();
            else
                param.url.shift();
        }
    }

    type = typeof type === "string" ? type : "route";
    animation = typeof animation === "string" ? animation : "forward";
    target = typeof target === "string" ? target : "#core-content";
    let scrollNext = isNumberPositive(scroll) ? parseInt(scroll) : 0;
    scroll = document.documentElement.scrollTop;
    setHistory = (typeof setHistory === "undefined" && target === "#core-content") || (typeof setHistory !== "undefined" && ["false", "0", 0, !1].indexOf(setHistory) === -1);
    replaceHistory = typeof replaceHistory !== "undefined" && ["true", "1", 1, !0].indexOf(replaceHistory) > -1;
    let file = route === "" ? "index" : route;
    let novaRota = type !== "route" || route !== app.route;
    app.route = route;
    app.file = file;

    return _pageTransition(type, animation, target, param, scroll, scrollNext, setHistory, replaceHistory, novaRota, isGridView, reload);
}

/**
 * @param type
 * @param animation
 * @param target
 * @param param
 * @param scroll
 * @param scrollNext
 * @param setHistory
 * @param replaceHistory
 * @param novaRota
 * @param isGridView
 * @param reload
 * @returns {Promise<unknown[]>}
 * @private
 */
async function _pageTransition(type, animation, target, param, scroll, scrollNext, setHistory, replaceHistory, novaRota, isGridView, reload) {
    clearPage();
    app.setLoading();
    PARAM = param.url;

    if (!$(target).length) {
        historyReqPosition++;
        historyPosition = -2;
        history.back();
        return;
    }

    if (!history.state)
        history.replaceState({
            id: 0,
            route: app.route,
            type: "route",
            target: "#core-content",
            param: param,
            firstPage: !0,
            scroll: scroll
        }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
    else if (setHistory)
        history.replaceState({
            id: history.state.id,
            route: history.state.route,
            type: history.state.type,
            target: history.state.target,
            param: history.state.param,
            firstPage: history.state.firstPage,
            scroll: scroll
        }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + history.state.route);

    if (setHistory && !reload && novaRota) {
        if (replaceHistory) {
            history.replaceState({
                id: historyPosition++,
                route: app.route,
                type: type,
                target: target,
                param: param,
                firstPage: !1,
                scroll: 0
            }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
        } else {
            history.pushState({
                id: historyPosition++,
                route: app.route,
                type: type,
                target: target,
                param: param,
                firstPage: !1,
                scroll: 0
            }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
        }
    }

    if(!setHistory && target !== "#core-content") {
        let n = localStorage.maestruNavigation ? JSON.parse(localStorage.maestruNavigation) : [];
        n.push({route: app.route, type: type, animation: animation, target: target, param: param, scroll: scroll, scrollNext: scrollNext});
        localStorage.maestruNavigation = JSON.stringify(n);
    }

    return Promise.all([]).then(async () => {

        if (typeof destruct === "function")
            destruct();

        window.destruct = function() {};

        if (historyReqPosition)
            animation = "none";

        let $element = (typeof target === "undefined" ? $("#core-content") : (typeof target === "string" ? $(target) : target));
        let topDistanceAux = (scrollNext > 0 ? -scrollNext : 0) + $element[0].getBoundingClientRect().top + scroll;
        let $page = (aniTransitionPage ? aniTransitionPage : defaultPageTransitionPosition(animation, $element, app.file));

        exeFunction(() => {
            let backup = [$page.css("margin-top"), $page.css("padding-top")];
            let style = {"padding-top": topDistanceAux + "px"};
            if(topDistanceAux < 0)
                style['top'] = topDistanceAux + "px";

            $page.css("display", "block");
            window["animate" + ucFirst(animation)]($element, $page, style, backup, scrollNext);
        });

        if (type === 'route') {
            return app.applyView(app.file, $page)
        } else if (type === 'grid') {

            //if gridCrud not exist, await until its load
            if (typeof gridCrud !== "function") {
                await new Promise(s => {
                    let rrr = setInterval(() => {
                        if (typeof gridCrud === "function") {
                            clearInterval(rrr);
                            s(1);
                        }
                    }, 20)
                });
            }

            return $page.grid(history.state.route);
        } else if (type === 'report') {

            //if reportTable not exist, await until its load
            if (typeof reportTable !== "function") {
                await new Promise(s => {
                    let rrr = setInterval(() => {
                        if (typeof reportTable === "function") {
                            clearInterval(rrr);
                            s(1);
                        }
                    }, 20)
                });
            }

            return $page.reportTable(history.state.route)
        } else if (type === 'form') {

            //if formCrud not exist, await until its load
            if (typeof formCrud !== "function") {
                await new Promise(s => {
                    let rrr = setInterval(() => {
                        if (typeof formCrud === "function") {
                            clearInterval(rrr);
                            s(1);
                        }
                    }, 20)
                });
            }

            let id = typeof param === "object" && isNumberPositive(param.id) ? parseInt(param.id) : "";
            let parent = typeof param === "object" && typeof param.parent === "string" ? param.parent : null;
            let parentColumn = typeof param === "object" && typeof param.column === "string" ? param.column : null;
            let store = typeof param.store === "undefined" || ["false", "0", 0, false].indexOf(param.store) === -1 ? 1 : 0;
            let data = (typeof param === "object" && typeof param.data === "object" && !isEmpty(param.data) ? param.data : {});
            let relationData = typeof history.state.param.dataRelation !== "undefined" ? history.state.param.dataRelation : [];

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

                /**
                 * Update the actual register relation Data
                 */
                let dataOnRelation = form.data;
                dataOnRelation.id = form.id;
                relationData[history.state.param.openForm.column] = dataOnRelation;

                /**
                 * Check for same relation in others registers to update
                 */
                let allRegisters = await dbLocal.exeRead(history.state.route);
                if (!isEmpty(allRegisters)) {
                    for (let reg of allRegisters) {
                        if (reg[history.state.param.openForm.column] == form.id) {
                            reg.relationData[history.state.param.openForm.column] = dataOnRelation;
                            dbLocal.exeCreate(history.state.route, reg);
                        }
                    }
                }

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

            return Promise.all(promisses).then(() => {
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

                form.dataRelation = relationData;
                if (!isEmpty(data) && (Object.keys(data).length > 1 || typeof data.id === "undefined")) {
                    form.setData(data);
                    id = "";
                }

                /**
                 * Back form after save if is in grid view
                 */
                if (!isGridView)
                    form.setReloadAfterSave(!1);

                form.show(id);

                if (haveFormRelation || history.state.param.modified) {
                    form.saved = !1;
                    form.modified = !0;
                }
            });
        } else {
            $page.html(history.state.route);
            return Promise.all([]);
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
        app.removeLoading();
    }).catch(e => {
        app.removeLoading();
        errorLoadingApp("pageTransition", e)
    });
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

function goBackMaestruNavigation() {
    let n = JSON.parse(localStorage.maestruNavigation);
    n.pop();
    let routeBack = n.pop();
    localStorage.maestruNavigation = JSON.stringify(n);

    pageTransition(routeBack.route, routeBack.type, "back", routeBack.target, routeBack.param, routeBack.scroll, routeBack.setHistory, routeBack.replaceHistory);
}

function goLinkPageTransition(url, $this, e) {
    let $rNetwork = $this.closest(".r-network");
    let idParent = $rNetwork.length && $rNetwork.attr("id") !== "undefined" ? $rNetwork.attr("id") : "core-content";
    if (url === "#back") {
        e.preventDefault();

        if(idParent === "core-content" || !localStorage.maestruNavigation) {
            if(localStorage.navigationCount === "0")
                location.href = HOME;
            else
                history.back();
        } else {
            goBackMaestruNavigation();
        }

    } else {
        let animation = $this.data("animation") || "forward";
        let target = $this.data("target") || "#" + idParent;
        let route = $this.data("route") || "route";
        let p = new RegExp(/^#/i);
        let pjs = new RegExp(/^javascript/i);
        if ($this.attr("target") !== "_blank" && !p.test(url) && !pjs.test(url)) {
            e.preventDefault();

            if (url !== app.route)
                pageTransition(url, route, animation, target);
        }
    }
}

/**
 * Set data on user, updating his data on local and server
 * @param field
 * @param value
 * @returns {Promise<unknown>}
 */
async function setUserData(field, value) {
    let updates = {};

    /**
     * Update user local application
     */
    if (typeof value !== "undefined" && typeof field === "string" && dicionarios[USER.setor][field]) {
        /**
         * one field and one value
         */
        USER.setorData[field] = value;
        updates[field] = value;

    } else if (typeof field === "object" && field !== null && field.constructor === Object && typeof value === "undefined") {
        /**
         * One object
         */
        for (let c in field) {
            if (typeof c === "string" && typeof field[c] !== "undefined" && dicionarios[USER.setor][c]) {
                USER.setorData[c] = field[c];
                updates[c] = field[c];
            }
        }

    } else if (typeof field === "object" && field !== null && field.constructor === Array && typeof value === "object" && value !== null && value.constructor === Array) {
        /**
         * Two arrays, first is fields, second is values
         */
        for (let i in field) {
            if (typeof field[i] === "string" && typeof value[i] !== "undefined" && dicionarios[USER.setor][field[i]]) {
                USER.setorData[field[i]] = _getDefaultValue(dicionarios[USER.setor][field[i]], value[i]);
                updates[field[i]] = _getDefaultValue(dicionarios[USER.setor][field[i]], value[i]);
            }
        }
    }

    /**
     * Update user in indexedDB
     */
    storeUser();

    /**
     * Update user in server base
     */
    if (isOnline())
        return AJAX.post("setUserData", updates).catch(() => {});
}

/**
 * Store user data in indexedDB
 */
function storeUser() {
    let userLogin = Object.assign({}, USER);
    userLogin.idUserReal = USER.id;
    userLogin.id = 1;
    return dbLocal.exeCreate("__login", userLogin);
}

/**
 * Get user profile in server to update local
 * @returns {Promise<void>}
 */
const sse = {
    base: {},
    baseAjaxInterval: null,
    baseViewData: {},
    funcoes: {},
    remove: (name) => {
        sse.funcoes[name] = [];
    },
    add: (name, funcao) => {
        if(typeof sse.funcoes[name] === "undefined")
            sse.funcoes[name] = [];

        if (typeof funcao === "function")
            sse.funcoes[name].unshift(funcao);
    },
    receiveData: async (data, type) => {
        switch (type) {
            case 'base':
                /**
                 * For each SSE received on view
                 * If have event function on receive this SSE to trigger
                 */
                if(data) {
                    for (let i in data) {
                        if (data[i].response === 1) {
                            if(!isEmpty(sse.funcoes[i])) {
                                for(let f of sse.funcoes[i]) {
                                    if(typeof f === "function")
                                        f(data[i].data);
                                }
                            }
                        }
                    }
                }
                break;
            case 'db':
                if(data && !isEmpty(data) && data.constructor === Object) {
                    for (let entity in data) {
                        dbLocal.clear("_cache_db_" + entity);
                        _checkRealtimeDbUpdate(entity);

                        /**
                         * Reload all grids
                         * */
                        if(typeof grids === "object" && grids !== null) {
                            for(let a in grids)
                                grids[a].reload();
                        }
                    }
                }
                break;

            case 'get':
                if(data && !isEmpty(data) && data.constructor === Object) {

                    for(let getUrl in data) {
                        let c = JSON.parse(data[getUrl]);
                        if(typeof c === "object" && typeof c.data !== "undefined" && !isEmpty(c.data) && typeof getUrl === "string") {

                            let cacheName = '_cache_get_' + getUrl;
                            let splited = getUrl.split("___");
                            let viewName = replaceAll(splited[0], "[@]", "/");
                            let request = replaceAll(splited[1], "[@]", "/");
                            let dados = c.data;

                            /**
                             * Cache the data
                             */
                            await dbLocal.clear(cacheName);
                            dbLocal.exeCreate(cacheName, {id: 1, result: JSON.stringify(dados)});

                            /**
                             * Update DOM data-get realtime
                             */
                            if(app.file !== viewName)
                                continue;

                            while(app.loading)
                                await sleep(10);

                            setTimeout(function() {
                                renderDataGet(request, dados);
                            }, 50);
                        }
                    }
                }
                break;
        }
    },
    start: () => {
        if (sse.isSSESupported()) {
            if(1===0 && typeof SharedWorker !== "undefined") {
                sse.base = new SharedWorker(HOME + "sseWork.js");

                sse.base.port.addEventListener("message", function(e) {
                    let d = JSON.parse(e.data);
                    sse.receiveData(d.data, d.type);
                }, false);

                sse.base.port.start();
                sse.base.port.postMessage(USER.token);

            } else {
                sse.base = new EventSource(SERVER + "get/sseEngineEvent/maestruToken/" + USER.token, {withCredentials: true});

                sse.base.addEventListener('base', async function (e) {
                    sse.receiveData(JSON.parse(e.data), 'base');
                }, !1);

                sse.base.addEventListener('db', async function (e) {
                    sse.receiveData(JSON.parse(e.data), 'db');
                }, !1);

                sse.base.addEventListener('get', async function (e) {
                    sse.receiveData(JSON.parse(e.data), 'get');
                }, !1);
            }
        } else {
            sse.baseAjaxInterval = setInterval(function () {
                AJAX.get("sseEngine").then(sse.baseReceiveListenerAjax);
            }, 2000);
        }

        /**
         * sync when online
         * */
        setInterval(async function () {
            if(isOnline()) {
                let sync = await dbLocal.exeRead("_syncDB");
                if(!isEmpty(sync)) {
                    for(let s of sync) {
                        if(typeof s.action === "delete" && typeof s.dados.id === "number")
                            AJAX.post("exeDelete", {entity: s.entity, id: s.dados.id}).catch(() => {});
                        else if(typeof s.entity === "string" && s.entity.length && !isEmpty(s.dados))
                            AJAX.post("exeCreate", s).catch(() => {});
                    }

                    dbLocal.clear("_syncDB");
                }
            }
        }, 1000);
    },
    close: () => {
        if(sse.isSSESupported()) {
            if(typeof sse.base !== "undefined") {
                if (1===0 && typeof SharedWorker !== "undefined" && typeof sse.base.port !== "undefined")
                    sse.base.port.close();
                else if (typeof sse.base !== "undefined" && typeof sse.base.close === "function")
                    sse.base.close();
            }
        } else {
            clearInterval(sse.baseAjaxInterval);
        }
    },
    baseReceiveListenerAjax: async (data) => {
        for(let n in data) {
            if (typeof sse.base[n] === "function" && !isEmpty(data[n]))
                await sse.base[n](data[n]);
        }
    },
    isSSESupported: () => {
        return isOnline() && typeof (EventSource) !== "undefined";
    }
};

/**
 * Controle de navegação maestru
 * histórico do navegador
 * @param event
 */
function maestruHistoryBack(event) {
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

        if(event.state.firstPage) {
            onHistoryBack(function() {
                toast("mais uma vez para sair", 1000);
            });
        }

        historyPosition = event.state.id + 1;
    }
}

/**
 * Seta uma função para executar ao voltar a navegação
 * após executar a função, volta ao padrão do maestru
 *
 * @param funcao
 */
function onHistoryBack(funcao) {
    if(typeof funcao === "function") {
        window.onpopstate = function(e) {
            e.preventDefault();
            funcao(e);
            window.onpopstate = null;
            window.history.forward();
            setTimeout(function() {
                window.onpopstate = maestruHistoryBack;
            }, 300);
        };
    }
}

/**
 * Ao carregar todo o documento executa esta função
 */
async function onLoadDocument() {
    setTimeout(function () {
        $("#core-loader-container").css({"opacity": 0});
        setTimeout(function () {
            $("#core-loader-container").css({"display": "none"});
        }, 250);
    }, 100);

    document.body.addEventListener("touchstart", function() {}, (supportsPassive ? {passive: true} : !1));

    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });

    window.onpopstate = maestruHistoryBack;

    window.onbeforeunload = function () {
        sse.close();
        AJAX.get("isOffline");
    };

    /**
     * Intercepta clicks em links e traduz na função "pageTransition()"
     */
    $("body").off("mousedown", "a").on("mousedown", "a", function () {
        timeWaitClick = ($("input, textarea").is(':focus') ? 200 : 0);

    }).off("click", "a").on("click", "a", function (e) {
        let $this = $(this);

        if (timeWaitClick > 0) {
            let url = $this.attr("href").replace(HOME, '').replace(SERVER, '');
            if ($this.attr("target") !== "_blank" && !$this.hasAttr("data-preventDefault")) {
                e.preventDefault();
                setTimeout(function () {
                    goLinkPageTransition(url, $this, e);
                }, timeWaitClick);
            }
        } else if (!$this.hasAttr("data-preventDefault")) {
            let url = $this.attr("href").replace(HOME, '').replace(SERVER, '');
            goLinkPageTransition(url, $this, e);
        } else {
            e.preventDefault();
        }
    }).off("submit", "form").on("submit", "form", function (e) {
        e.preventDefault()
    });

    /**
     * Default button header sidebar toggle click
     */
    $(".core-open-menu").off("click").on("click", function () {
        toggleSidebar();
    });
}

async function startApplication() {
    await checkSessao();
    sse.start();
    await updateAppOnDev();
    await $("#core-header").htmlTemplate('header');
    await menuConstructor();
    await readRouteState();
    await onLoadDocument();
    localStorage.navigationCount = 0;
    localStorage.removeItem('maestruNavigation');

    await (!localStorage.accesscount ? firstAccess() : thenAccess());

    setTimeout(function () {
        checkUpdate();
    }, 500);

    if (localStorage.accesscount === "1") {

        /**
         * Recupera syncs pendentes deste usuário
         */
        loadSyncNotSaved();

        if (SERVICEWORKER && HOME !== "" && HOME === SERVER) {
            setTimeout(function () {
                loadUserViews();
            }, 3000);
        }
    }
}

$(function () {
    (async () => {
        if (SERVICEWORKER && isOnline() && !navigator.serviceWorker.controller)
            await navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION);

        if (isMobile() && screen.orientation && typeof screen.orientation.lock === "function")
            screen.orientation.lock('portrait').catch(() => {});

        await startApplication();
    })();
});