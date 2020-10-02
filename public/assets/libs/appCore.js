function isMobile() {
    return window.innerWidth < 900 && window.innerHeight > window.innerWidth;
}

function isBuild() {
    return !SERVICEWORKER && HOME === "";
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
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1)
    }
    return function (a, b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
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
    var result = object = {};
    var arr = key.split('.');
    for (var i = 0; i < arr.length - 1; i++) {
        object = object[arr[i]] = {};
    }
    object[arr[arr.length - 1]] = value;
    return result;
}

function getObjectDotNotation(obj, dotnotation) {
    var arr = dotnotation.split(".");
    while (arr.length && (obj = obj[arr.shift()])) ;
    return obj;
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
    mergeObject(p, {
        home: HOME,
        vendor: VENDOR,
        favicon: FAVICON,
        logo: LOGO,
        theme: THEME,
        themetext: THEMETEXT,
        sitename: SITENAME,
        USER: USER,
        URL: history.state.param.url,
        PAGE: history.state.param,
        jsonParse: function () {
            return function (txt, render) {
                return _htmlTemplateJsonDecode(txt, render);
            }
        },
        jsonDecode: function () {
            return function (txt, render) {
                return _htmlTemplateJsonDecode(txt, render);
            }
        }
    });

    mergeObject(p, SSE);

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

        let param = {USER: USER, URL: URL};
        mergeObject(param, SSE);
        let entity = Mustache.render($this.data("db"), param);
        let id = ($this.hasAttr("data-id") ? $this.attr("data-id") : {});
        id = isNumberPositive(id) ? parseInt(id) : (isJson(id) ? JSON.parse(id) : (typeof id === "string" ? {"*": "%" + id + "%"} : {}));
        let limit = ($this.hasAttr("data-limit") ? Mustache.render($this.data("limit"), param) : null);
        let offset = ($this.hasAttr("data-offset") ? Mustache.render($this.data("offset"), param) : null);
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
        loo = templateTpl.split("{{");
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
     * @param realtime
     * @returns {Promise<void>}
     * @private
     */
    $.fn._renderDbTemplate = async function($tpl, updateInRealTime) {
        let $this = $(this);
        if(!$this.hasAttr("data-db"))
            return;

        while(app.loading)
            await sleep(10);

        updateInRealTime = typeof updateInRealTime !== "undefined" ? updateInRealTime : !1;
        let $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();
        let tpl = await getTemplates();

        /**
         * Check cache values to apply before
         */
        let cache = (await dbLocal.exeRead('_cache_' + $this.data("db"))).reverse();
        if(!isEmpty(cache)) {

            if(cache.length === 1 && typeof cache[0].typeIsObject !== "undefined" && !cache[0].typeIsObject)
                cache = cache[0];

            if(isEmpty(cache) && $this.hasAttr("data-template-empty"))
                $templateChild = Mustache.render($tpl.data("template-empty"), _htmlTemplateDefaultParam());

            if(!updateInRealTime || (!$this.hasAttr("data-realtime-db") && !$this.hasAttr("data-realtime")) || $this.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
                await $this.htmlTemplate($templateChild, cache);
            else
                await _updateTemplateRealTime($this, ($tpl.hasAttr("data-template") ? tpl[$templateChild] : $templateChild), cache);

            if(isEmpty(cache) && $this.hasAttr("data-template-empty"))
                $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();
        }

        /**
         * get the data to use on template if need
         */
        let dados = await $this.dbExeRead();

        if($this.hasAttr("data-db-function") && $this.data("db-function") !== "" && typeof window[$this.data("db-function")] === "function")
            dados = await window[$this.data("db-function")](dados);
        else if($this.hasAttr("data-function") && $this.data("function") !== "" && typeof window[$this.data("function")] === "function")
            dados = await window[$this.data("function")](dados);
        else if($this.hasAttr("data-realtime-db") && $this.data("realtime-db") !== "" && typeof window[$this.data("realtime-db")] === "function")
            dados = await window[$this.data("realtime-db")](dados);

        let parametros = {};

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

        /**
         * Cache the data
         */
        await dbLocal.clear('_cache_' + $this.data("db"));
        if(!isEmpty(dados)) {
            if(typeof dados === "object" && dados !== null && dados.constructor === Array) {
                for(let d of dados)
                    dbLocal.exeCreate('_cache_' + $this.data("db"), d);
            } else {
                dados.typeIsObject = !1;
                dbLocal.exeCreate('_cache_' + $this.data("db"), dados);
            }
        }

        /**
         * Check if use the realtime render or the default render
         */
        if(!updateInRealTime || (!$this.hasAttr("data-realtime-db") && !$this.hasAttr("data-realtime")) || $this.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
            $this.htmlTemplate($templateChild, dados);
        else
            _updateTemplateRealTime($this, ($tpl.hasAttr("data-template") ? tpl[$templateChild] : $templateChild), dados);
    };

    /**
     * Render template with data-get
     * @param $tpl
     * @param realtime
     * @returns {Promise<void>}
     * @private
     */
    $.fn._renderGetTemplate = async function($tpl, updateInRealTime) {
        let $this = $(this);
        if(!$this.hasAttr("data-get"))
            return;

        while(app.loading)
            await sleep(10);

        updateInRealTime = typeof updateInRealTime !== "undefined" ? updateInRealTime : !1;
        let $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();
        let tpl = await getTemplates();

        /**
         * Check cache values to apply before
         */
        let cache = await dbLocal.exeRead('_cache_get_' + $this.data("get"));
        if(!isEmpty(cache)) {

            if(cache.length === 1 && typeof cache[0].typeIsObject !== "undefined" && !cache[0].typeIsObject)
                cache = cache[0];

            if(isEmpty(cache) && $this.hasAttr("data-template-empty"))
                $templateChild = Mustache.render($tpl.data("template-empty"), _htmlTemplateDefaultParam());

            if(!updateInRealTime || (!$this.hasAttr("data-realtime-get") && !$this.hasAttr("data-realtime")) || $this.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
                await $this.htmlTemplate($templateChild, cache);
            else
                await _updateTemplateRealTime($this, ($tpl.hasAttr("data-template") ? tpl[$templateChild] : $templateChild), cache);

            if(isEmpty(cache) && $this.hasAttr("data-template-empty"))
                $templateChild = $tpl.hasAttr("data-template") ? Mustache.render($tpl.data("template"), _htmlTemplateDefaultParam()) : $tpl.html();
        }

        /**
         * get the data to use on template if need
         */
        let dados = await AJAX.get($this.data("get"));
        if($this.hasAttr("data-get-function") && $this.data("get-function") !== "" && typeof window[$this.data("get-function")] === "function")
            dados = await window[$this.data("get-function")](dados);
        else if($this.hasAttr("data-function") && $this.data("function") !== "" && typeof window[$this.data("function")] === "function")
            dados = await window[$this.data("function")](dados);
        else if($this.data("realtime-get") !== "" && typeof window[$this.data("realtime-get")] === "function")
            dados = await window[$this.data("realtime-get")](dados);

        let parametros = {};

        if(isEmpty(dados) && $this.hasAttr("data-template-empty")) {
            parametros = ($this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
            $templateChild = Mustache.render($tpl.data("template-empty"), _htmlTemplateDefaultParam());
        } else {
            parametros = (isEmpty(dados) && $this.hasAttr("data-param-empty") ? $this.data("param-empty") : ($this.hasAttr("data-param") ? $this.data("param") : {}));
        }

        if ($this.hasAttr("data-param-function") && $this.data("param-function") !== "" && typeof window[$this.data("param-function")] === "function")
            parametros = await window[$this.data("param-function")](parametros);

        if (!isEmpty(parametros) && typeof parametros === "object") {
            if(!isEmpty(dados))
                mergeObject(dados, parametros);
            else
                dados = parametros;
        }

        /**
         * Cache the data
         */
        await dbLocal.clear('_cache_get_' + $this.data("get"));
        if(!isEmpty(dados)) {
            if(typeof dados === "object" && dados !== null && dados.constructor === Array) {
                for(let d of dados)
                    dbLocal.exeCreate('_cache_get_' + $this.data("get"), d);
            } else {
                dados.typeIsObject = !1;
                dbLocal.exeCreate('_cache_get_' + $this.data("get"), dados);
            }
        }

        /**
         * Check if use the realtime render or the default render
         */
        if(!updateInRealTime || (!$this.hasAttr("data-realtime-get") && !$this.hasAttr("data-realtime")) || $this.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
            $this.htmlTemplate($templateChild, dados);
        else
            _updateTemplateRealTime($this, ($tpl.hasAttr("data-template") ? tpl[$templateChild] : $templateChild), dados);
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

        /**
         * Listen for changes on data-filter fields
         */
        $this.find("[data-db][data-realtime-db]").each(function(i, e) {
            $.each(e.attributes, function () {
                if (this.specified) {
                    if (/^data-filter-/.test(this.name) || this.name === "data-filter") {
                        if (this.name === "data-filter") {

                        } else {
                            let field = this.name.replace("data-filter-", "");
                            let $filterField = $(this.value);
                            if ($filterField.length === 1) {
                                if ($filterField.hasAttr("type") && $filterField.attr("type") === "text") {
                                    $filterField.off("keyup change click").on("keyup", function () {
                                        let value = $(this).val();
                                        clearTimeout(timerWriting);
                                        timerWriting = setTimeout(async function () {
                                            let data = ($(e).hasAttr("data-id") ? $(e).attr("data-id") : {});
                                            data = isNumberPositive(data) ? {"id": data} : (isJson(data) ? JSON.parse(data) : (typeof data === "string" ? {"*": "%" + data + "%"} : {}));
                                            if(value !== "")
                                                data[field] = "%" + value + "%";
                                            else if(typeof data[field] !== "undefined")
                                                delete data[field];

                                            $(e).attr("data-id", JSON.stringify(data)).loading();

                                            let intL = setInterval(function() {
                                                $(e).loading();
                                            }, 2000);

                                            await _checkRealtimeDbUpdate($(e).data("db"));

                                            clearInterval(intL);
                                        }, 300);
                                    });
                                }
                            }
                        }
                    }
                }
            });
        });
    };

    /**
     * Renderiza template mustache no elemento
     * @param tpl
     * @param param
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
                    $this._renderDbTemplate($(e));
                }
            });
        }

        let $contentGet = $("<div>" + templateTpl + "</div>").find("[data-get]");
        if ($contentGet.length) {
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
                     * Apply Skeleton
                     */
                    $this._skeletonDOMApply($(e), param);

                    /**
                     * Get data and render the template
                     * not await for this
                     */
                    $this._renderGetTemplate($(e));
                }
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
    });
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
    var result = keys.join(comma) + "\n";

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

function pushNotification(title, body, url, image, background) {
    swRegistration.showNotification(title, {
        body: body || "",
        data: url || "",
        icon: image || "",
        image: background || "",
        badge: HOME + FAVICON
    });
}

async function checkUpdate() {
    if (isOnline() && SERVICEWORKER) {
        if (!localStorage.update)
            localStorage.update = await AJAX.post("update");
        else if (parseFloat(VERSION) > parseFloat(localStorage.update))
            toast("<div class='left'>Nova versão</div><button style='float: right;border: none;outline: none;box-shadow: none;padding: 10px 20px;border-radius: 5px;margin: -5px -11px -5px 20px;background: #fff;color: #555;cursor: pointer;' onclick='updateCache()'>atualizar</button>", 15000, "toast-success");
    }
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

async function logoutDashboard() {
    if (isOnline()) {
        toast("Saindo...", 42000);
        await AJAX.get("logout");
        await setCookieAnonimo();
        location.href = HOME + (HOME !== SERVER ? "index.html?url=index" : "");
    } else {
        toast("Sem Conexão", 1200)
    }
}

/**
 * Ajusta os dados do Header, navbar, menu, sidebar, btn login, btn push
 * verifica visibilidade destes itens
 */
async function menuHeader() {
    let tpl = await getTemplates();

    $("#core-header").html(Mustache.render(tpl.header, {
        version: VERSION,
        sitename: SITENAME,
        home: HOME,
        homepage: (HOMEPAGE === "1" ? "dashboard" : "")
    }));

    let $menuCustom = null;
    if (($menuCustom = $("#core-menu-custom")).length) {
        $menuCustom.html("");
        let menu = await dbLocal.exeRead("__menu", 1);
        if (!isEmpty(menu)) {
            for (let m of menu) {
                if (typeof m.html === "string" && m.html !== "undefined" && !isEmpty(m.html))
                    $menuCustom.append(Mustache.render(tpl.menuHeader, m));
            }
        }
    }

    let $menuNav = null;
    if (($menuNav = $("#core-header-nav-bottom")).length) {
        let $menu = $("#core-menu-custom-bottom").html("");

        let navbar = await dbLocal.exeRead("__navbar", 1);
        if (!isEmpty(navbar)) {
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

    $("#core-sidebar").htmlTemplate('aside');

    /**
     * Edit perfil action
     */
    $("#app").off("click", ".btn-edit-perfil").on("click", ".btn-edit-perfil", function () {
        let entity = (USER.setor === "admin" ? "usuarios" : USER.setor);
        let id = {id: parseInt(USER.setor === "admin" ? USER.id : USER.setorData.id)};
        let target = $(".main > .container").length ? ".main > .container" : ".main > .core-class-container";
        if (history.state.route !== entity || history.state.type !== "form")
            pageTransition(entity, 'form', 'forward', target, id);
    }).off("click", ".btn-login").on("click", ".btn-login", function () {
        if (USER.setor != 0)
            logoutDashboard();
        else
            pageTransition("login", "route", "forward", "#core-content", null, null, !1);
    });

    /**
     * Edição do perfil somente usuários logados
     */
    if ($("#core-sidebar-edit").length) {
        if (USER.setor.toString() !== "0")
            $("#core-sidebar-edit").css("display", "block");
    }
}

function allowThisType(meta, fields) {
    return (meta.column !== "system_id" || (USER.setor === "admin" && meta.nome !== "")) && meta.format !== "password" && meta.key !== "information" && meta.key !== "identifier" && meta.datagrid !== !1 && !fields.find(s => s.nome === meta.nome);
}

function getFieldsData(entity, haveId, r) {
    let fields = ["", "", "", "", "", "", ""];
    relevants = r[0];
    relation = r[1][entity];
    info = r[2][entity];
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
    let clear = [];
    localStorage.removeItem("accesscount");

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    let syncData = await dbLocal.exeRead("_syncDB");
    if (!isEmpty(syncData))
        await AJAX.post("up/sync", syncData);

    dbLocal.clear("_syncDB");

    /**
     * Clear history user on server
     */
    await AJAX.get("clearUserHistory");

    /**
     * Clear indexedDB
     */
    if(!isEmpty(dicionarios)) {
        for (let entity of Object.keys(dicionarios))
            dbLocal.clear(entity);
    }

    return Promise.all(clear).then(() => {
        return clearIndexedDbGets().then(() => {
            if (SERVICEWORKER) {

                /**
                 * Clear cache pages
                 */
                return caches.keys().then(cacheNames => {
                    return Promise.all(cacheNames.map(cacheName => {
                        let corte = cacheName.split("-v");
                        if (corte[1] !== VERSION || ["viewUser", "viewUserCss", "viewUserJs", "viewUserGet"].indexOf(corte[0]) > -1)
                            caches.delete(cacheName);
                    }))
                })
            }
        })
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
        await AJAX.post("up/sync", syncData);

    dbLocal.clear("_syncDB");

    /**
     * Clear history user on server
     */
    await AJAX.get("clearUserHistory");

    /**
     * Clear indexedDB
     */
    for (let entity of Object.keys(dicionarios))
        dbLocal.clear(entity);

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

        if(isEmpty(dicionarios))
            await loadCacheUser();
    }
}

function setCookieAnonimo() {
    let token = Date.now() + Math.floor((Math.random() * 100000) + 1);
    return setCookieUser({token: "T!" + token, id: (token * -1), nome: 'Anônimo', imagem: '', setor: 0});
}

function setCookieUser(user) {
    if (isOnline()) {

        /**
         * Limpa dados de usuário
         * */
        return clearCacheUser().then(() => {

            /**
             * Seta usuário
             * */
            return setUserInNavigator(user);
        });

    } else {
        toast("Sem Conexão", 1200);
    }
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
        return caches.open('viewUser-v' + VERSION).then(cache => {

            /**
             * Cache views
             */
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
            return caches.open('viewUserJs-v' + VERSION).then(cache => {
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
        return caches.open('viewUser-v' + VERSION).then(cache => {

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

                return caches.open('viewUserJs-v' + VERSION).then(c => {
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
    if (isOnline()) {

        /**
         * Stop SSE events
         */
        if (isUsingSSE() && typeof sseSource === "object" && typeof sseSource.close === "function")
            sseSource.close();
        else
            clearInterval(sseEngineAjax);

        return getIndexedDbGets().catch(e => {
            errorLoadingApp("loadCacheUser", e);
        });

    } else {
        toast("Sem Conexão!", 3000, "toast-warning");
        return Promise.all([])
    }
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

async function setNotificationOpen(id) {
    db.exeCreate("notifications_report", {id: id, abriu: 1});
}

async function closeNote(id) {

    /**
     * Deleta card de notificação
     */
    let $note = $(".notification-item[rel='" + id + "']");
    $note.addClass("activeRemove");
    setTimeout(function () {
        $note.remove();
    }, 150);

    /**
     * Deleta notification report
     */
    db.exeDelete("notifications_report", id);
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
    if(isOnline()) {
        console.log(e);
        toast("Erro ao carregar Aplicativo [" + id + "]", 3000, "toast-warning");
    } else {
        toast("Conexão perdida", 1400, "toast-warning");
    }
}

async function firstAccess() {
    localStorage.accesscount = 1;
    await cacheCoreApp();
    return loadViews();
}

async function cacheCoreApp() {
    if (!SERVICEWORKER)
        return Promise.all([]);

    return AJAX.get("currentFiles").then(g => {
        return caches.open('core-v' + VERSION).then(cache => {
            return cache.addAll(g.core).catch(e => {
                errorLoadingApp("cacheCoreApp: cache core", e)
            })
        }).then(() => {
            return caches.open('fonts-v' + VERSION).then(cache => {
                return cache.addAll(g.fonts).catch(e => {
                    errorLoadingApp("cacheCoreApp: cache fonts", e)
                })
            })
        }).then(() => {
            return caches.open('images-v' + VERSION).then(cache => {
                return cache.addAll(g.images).catch(e => {
                    errorLoadingApp("cacheCoreApp: cache images", e)
                })
            })
        }).then(() => {
            return caches.open('misc-v' + VERSION).then(cache => {
                return cache.addAll(g.misc).catch(e => {
                    errorLoadingApp("cacheCoreApp: cache misc", e)
                })
            })
        })
    })
}

function clearIndexedDbGets() {
    let clear = [];
    clear.push(dbLocal.clear('__historic'));
    clear.push(dbLocal.clear('__allow'));
    clear.push(dbLocal.clear('__dicionario'));
    clear.push(dbLocal.clear('__info'));
    clear.push(dbLocal.clear('__menu'));
    clear.push(dbLocal.clear('__template'));
    clear.push(dbLocal.clear('__graficos'));
    clear.push(dbLocal.clear('__navbar'));
    clear.push(dbLocal.clear('__react'));
    clear.push(dbLocal.clear('__relevant'));
    clear.push(dbLocal.clear('__general'));
    clear.push(dbLocal.clear('__totalRegisters'));

    return Promise.all(clear);
}

async function getIndexedDbGets() {
    let r = await AJAX.get("userCache");

    dicionarios = r['dicionario'];
    if (USER.setor === "admin") {
        let inputTypes = await get("inputTypes");
        for (let entity in dicionarios) {
            infoDic = r['info'][entity];
            if (infoDic.system !== "" && infoDic.user === 1) {
                dicionarios[entity].system_id = Object.assign({}, inputTypes.list, {
                    id: infoDic.identifier,
                    position: 0,
                    indice: infoDic.identifier,
                    column: "system_id",
                    default: !1,
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
    return dbLocal.exeCreate('__totalRegisters', r['totalRegisters']);
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
                    if (corte[1] !== VERSION || ["viewUser", "viewUserCss", "viewUserJs", "viewUserGet"].indexOf(corte[0]) > -1)
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

function sendPushTokenToServer(token) {
    $(".site-btn-push").remove();
    AJAX.post('push', {
        "push": token,
        'p1': navigator.appName,
        'p2': navigator.appCodeName,
        'p3': navigator.platform
    });
}

function subscribeUser() {
    if (USER.setor !== 0 && typeof firebaseConfig !== "undefined" && swRegistration && swRegistration.pushManager) {

        const messaging = firebase.messaging();
        messaging.usePublicVapidKey(PUSH_PUBLIC_KEY);

        if(Notification.permission === "granted") {

            /**
             * Check for token update
             */
            messaging.onTokenRefresh(() => {
                messaging.getToken().then(sendPushTokenToServer);
            });

        } else if(Notification.permission === "default") {

            /**
             * Ask for permission
             */
            messaging.requestPermission().then(() => {
                messaging.getToken().then(sendPushTokenToServer);
            }).catch(err => {
                console.log("Permissão para notificação negada. ", err);
            });

        } else {

            /**
             * Permissions denied
             */
            toast("Notificações já foram negadas! Para permitir novamente, limpe o cache do navegador para o site " + HOME.replace("https://", ""), 5000, "toast-infor");

        }
    }
}

async function thenAccess() {
    /**
     * Conta acesso
     */
    localStorage.accesscount = parseInt(localStorage.accesscount) + 1;

    /**
     * Check for refresh token if allready have push permission
     * */
    if (USER.setor !== 0 && PUSH_PUBLIC_KEY !== "" && typeof firebaseConfig !== "undefined" && swRegistration && swRegistration.pushManager && Notification && Notification.permission === "granted") {

        $(".site-btn-push").remove();

        const messaging = firebase.messaging();
        messaging.usePublicVapidKey(PUSH_PUBLIC_KEY);
        messaging.onTokenRefresh(() => {
            messaging.getToken().then(sendPushTokenToServer);
        });

        /**
         * receive notifications here when app open
         */
        messaging.onMessage((payload) => {
            toast("<div id='push-icon'>" + payload.notification.icon + "</div><div id='push-title'>" + payload.notification.title + "</div><div id='push-body'>" + payload.notification.body + "</div>", payload.notification.time || 4000, "toast-push");
            console.log('Message received. ', payload);
        });

    } else if (USER.setor === 0 || PUSH_PUBLIC_KEY === "" || typeof firebaseConfig === "undefined" || !swRegistration || !swRegistration.pushManager || !Notification || Notification.permission !== "default") {
        $(".site-btn-push").remove();
    }
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

function getPageContentHeight() {
    let heightHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header")[0].clientHeight : 0;
    let heightNavbar = (window.innerWidth < 900 && $("#core-header-nav-bottom").hasClass("core-show-header-navbar") ? 50 : 0);
    return "calc(100vh - " + (heightHeader + heightNavbar) + "px)"
}

function getPaddingTopContent() {
    if (!$("#core-header").hasClass("core-show-header-navbar") && window.innerWidth < 993)
        return getNotche("top");

    return 0;
}

function defaultPageTransitionPosition(direction, $element, route) {
    aniTransitionPage = $element;
    let left = $element[0].getBoundingClientRect().left;
    let paddingLeft = parseInt($element.css("padding-left"));
    let paddingRight = parseInt($element.css("padding-right"));
    let style = {
        "min-height": getPageContentHeight(),
        "position": "fixed",
        "top": $element[0].getBoundingClientRect().top + "px",
        "width": $element[0].clientWidth + "px",
        "padding-left": paddingLeft + "px",
        "padding-right": paddingRight + "px",
        "left": left + "px",
        "overflow": "hidden"
    };
    $element.css(style);

    let file = app.file.split("/");
    file = file[0];

    let $aux = null;
    let topHeader = $("#core-header").css("opacity") !== "0" ? $("#core-header")[0].clientHeight : 0;
    if ($(".cache-content[rel='" + route + "']").length) {
        $aux = $(".cache-content[rel='" + route + "']").removeClass("hide").css({"top": topHeader + "px"});
    } else {
        $aux = $("<section />").css(style).addClass("core-class-container r-network r-403 r-" + file).data("file", file).insertBefore($element);
    }

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
    });

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

    aniTransitionPage = null;
    window.scrollTo(0, scroll);
    clearHeaderScrollPosition();

    //add or not space on end content (navbar space)
    if (window.innerWidth < 900 && $("#core-header-nav-bottom").hasClass("core-show-header-navbar"))
        $("#core-content").addClass("mb-50");
    else
        $("#core-content").removeClass("mb-50");
}

function animateForward(id, file, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('forward', $element, file);
    let left = $element[0].getBoundingClientRect().left;

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            let topHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header")[0].clientHeight : 0;
            $aux.css("top", topHeader + "px");
            if (window.innerWidth < 900) {
                $aux.animate({left: '0'}, 250, () => {
                    animateTimeout($element, $aux, 0)
                });
                $element.css("z-index", -1).animate({left: '-30%'}, 250)
            } else {
                $aux.animate({left: left + "px", opacity: 1}, 200, () => {
                    animateTimeout($element, $aux, 0)
                });
                $element.animate({left: (left - 100) + "px", opacity: 0}, 150)
            }
        }
    }, 10);

    return $aux
}

function animateBack(id, file, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('back', $element, file);
    let left = $element[0].getBoundingClientRect().left;

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            let topHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header")[0].clientHeight : 0;
            $aux.css("top", (-(scroll - topHeader)) + "px");
            if (window.innerWidth < 900) {
                $aux.animate({left: '0'}, 250, () => {
                    animateTimeout($element, $aux, scroll);
                });
                $element.css("z-index", -1).animate({left: '30%'}, 250)
            } else {
                $aux.animate({left: left + 'px', opacity: 1}, 200, () => {
                    animateTimeout($element, $aux, scroll)
                });
                $element.animate({opacity: 0}, 150);
            }
        }
    }, 10);

    return $aux
}

function animateFade(id, file, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('fade', $element, file);

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            let topHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header")[0].clientHeight : 0;
            $aux.css("top", topHeader + "px");
            scroll = typeof scroll !== "undefined" ? scroll : 0;
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
    }, 10);

    return $aux
}

function animateNone(id, file, scroll) {
    if (aniTransitionPage)
        return aniTransitionPage;

    let $element = (typeof id === "undefined" ? $("#core-content") : (typeof id === "string" ? $(id) : id));
    let $aux = defaultPageTransitionPosition('fade', $element, file);

    let t = setInterval(function () {
        if ($aux.html() !== "") {
            clearInterval(t);

            scroll = typeof scroll !== "undefined" ? scroll : 0;
            let topHeader = $("#core-header").hasClass("core-show-header-navbar") ? $("#core-header")[0].clientHeight : 0;
            $aux.animate({top: -(scroll - topHeader) + "px", left: 0, opacity: 1}, 0, () => {
                animateTimeout($element, $aux, scroll)
            });
            $element.animate({opacity: 0, left: '100%'}, 0);
        }
    }, 10);

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

var dicionarios,
    swRegistration = null,
    aniTransitionPage = null,
    lastPositionScroll = 0,
    sentidoScrollDown = !1,
    historyPosition = 1,
    historyReqPosition = 0,
    loadingEffect = null,
    deferredPrompt,
    timeWaitClick = 0;

const isIos = () => {
    let userAgent = window.navigator.userAgent;
    return (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i));
};

const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

function acceptInstallApp() {
    if (!localStorage.installAppAction) {
        closeInstallAppPrompt(1);
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then(choiceResult => {
            localStorage.installAppAction = choiceResult.outcome === 'accepted';
            if (localStorage.installAppAction)
                AJAX.post("appInstaled", {success: !0, ios: isIos()});
            else
                AJAX.post("appInstaled", {success: !1, ios: isIos()});
        });
    }
}

function closeInstallAppPrompt(onInstall) {
    let $installCard = $("#installAppCard").addClass("transformDown");
    $("#core-overlay").removeClass("active activeBold");
    localStorage.installAppAction = 0;
    AJAX.post("appInstaledPrompt", {success: typeof onInstall !== "undefined", ios: isIos()});

    setTimeout(function () {
        $installCard.remove();
    }, 200);
}

function openInstallAppPrompt(force) {
    if (!isInStandaloneMode() && typeof deferredPrompt !== "undefined" && typeof force === "boolean" && ((typeof force === "boolean" && force) || !localStorage.installAppAction)) {
        getTemplates().then(tpl => {
            $("#core-overlay").addClass("active activeBold");
            $("#app").append(Mustache.render(tpl.installAppCard, {
                home: HOME,
                favicon: FAVICON,
                sitename: SITENAME,
                nome: USER.nome
            }));
        });
    }
}


/**
 *
 * @param $element
 * @param $template
 * @param param
 * @private
 */
async function _updateTemplateRealTime($element, $template, param) {
    if (typeof sseSourceListeners[app.file] !== "object")
        return;

    let isSetParam = typeof param !== "undefined";

    param = _htmlTemplateDefaultParam(!1, param);

    if(typeof $element === "undefined")
        $element = sseSourceListeners[app.file][0];

    if(typeof $template === "undefined")
        $template = $("<div>" + sseSourceListeners[app.file][1] + "</div>");

    let $elementIsolated = $("<div>" + $element.html() + "</div>");

    /**
     * First, find by the variables used
     */
    $element.find("[data-get][data-realtime-get]").each(async function (i, e) {
        let $t = $template.find("[data-get][data-realtime-get]").eq(i);
        if($t.length) {

            /**
             * get the data to use on template if need
             */
            let dados = await AJAX.get($(e).data("get"));
            if ($(e).hasAttr("data-get-function") && $(e).data("get-function") !== "" && typeof window[$(e).data("get-function")] === "function")
                dados = await window[$(e).data("get-function")](dados);
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
                        let valor = Mustache.render(this.value, param);
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
var timerWriting;

async function _checkRealtimeDbUpdate(entity) {
    return new Promise(s => {
        if(typeof sseSourceListeners[app.file] === "object") {
            let dbFind = "[data-db='" + entity + "'][data-realtime-db]";
            $("<div>" + sseSourceListeners[app.file][1] + "</div>").find(dbFind).each(async function (i, e) {
                let $tag = sseSourceListeners[app.file][0].find(dbFind).eq(i);

                /**
                 * get the data to use on template if need
                 */
                let dados = await $tag.dbExeRead();
                if ($(e).hasAttr("data-db-function") && $(e).data("db-function") !== "" && typeof window[$(e).data("db-function")] === "function")
                    dados = await window[$(e).data("db-function")](dados);
                else if($tag.data("realtime-db") !== "" && typeof window[$tag.data("realtime-db")] === "function")
                    dados = await window[$tag.data("realtime-db")](dados);

                let $templateChild = $(e);
                let parametros = {};

                if(isEmpty(dados) && $(e).hasAttr("data-template-empty")) {
                    parametros = ($(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                    $templateChild = $("<div>" + (await getTemplates())[$(e).data("template-empty")] + "</div>");
                } else {
                    parametros = (isEmpty(dados) && $(e).hasAttr("data-param-empty") ? $(e).data("param-empty") : ($(e).hasAttr("data-param") ? $(e).data("param") : {}));
                    if($(e).hasAttr("data-template"))
                        $templateChild = $("<div>" + (await getTemplates())[$(e).data("template-empty")] + "</div>");
                }

                if ($(e).hasAttr("data-param-function") && $(e).data("param-function") !== "" && typeof window[$(e).data("param-function")] === "function")
                    parametros = await window[$(e).data("param-function")](parametros);

                if (!isEmpty(parametros) && typeof parametros === "object") {
                    if(!isEmpty(dados))
                        mergeObject(dados, parametros);
                    else
                        dados = parametros;
                }

                if($tag.hasAttr("data-template-empty") || $templateChild.html().indexOf("{{#.}}") !== -1)
                    await $tag.htmlTemplate($templateChild.html(), dados);
                else
                    await _updateTemplateRealTime($tag, $templateChild, dados);

                s(1);
            });
        }
    })
}

/**
 * app global de navegação do app
 * */
var URL, app = {
    file: "",
    route: "",
    loading: !1,
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

        if ($div.html() !== "") {
            let pageHeader = $div.data('header');
            let pageNavbar = $div.data('navbar');
            let headerAssets = $div.data('head');

            TITLE = $div.data('title');
            headerShow(pageHeader);
            checkMenuActive();
            $("#core-title").text(TITLE);

            /**
             * add tags to the head of the page
             * if allready exist, so not do anything
             */
            if (!isEmpty(headerAssets)) {
                /**
                 * Remove link from head not used
                 */

                let idsLinks = Object.keys(headerAssets);
                $(".coreLinkHeader").each(function (i, e) {
                    if (idsLinks.indexOf($(e).attr("id")) === -1)
                        $(e).remove();
                });

                /**
                 * Add link to head
                 */
                for (let hid in headerAssets) {
                    if (!$("head > #" + hid).length)
                        $(headerAssets[hid]).appendTo("head");
                }
            } else {
                /**
                 * Remove all link from head
                 */
                $(".coreLinkHeader").remove();
            }

            if (pageNavbar)
                $("#core-header-nav-bottom").addClass("core-show-header-navbar");
            else
                $("#core-header-nav-bottom").removeClass("core-show-header-navbar");

            $div.css("min-height", getPageContentHeight());
            if ($div.attr("id") === "core-content")
                $div.css("padding-top", getPaddingTopContent() + "px");

            return Promise.all([]);

        } else {
            app.setLoading();
            let g = await AJAX.view(file);
            if (g) {
                if (file === "403" || app.haveAccessPermission(g.setor, g["!setor"])) {
                    TITLE = g.title;
                    headerShow(g.header);
                    checkMenuActive();
                    $("#core-title").text(g.title);

                    /**
                     * add tags to the head of the page
                     * if allready exist, so not do anything
                     */
                    $("html").removeClass();
                    if (!isEmpty(g.head)) {
                        /**
                         * Add link to head
                         */
                        for (let hid in g.head) {
                            if (/^core-/.test(hid))
                                $("html").addClass(hid);
                            else
                                $div.addClass(hid);

                            if (!$("head > #" + hid).length)
                                $(g.head[hid]).appendTo("head");
                        }
                    }

                    let templates = await getTemplates();
                    URL = history.state.param.url;

                    /**
                     * Include templates used in this view
                     */
                    if (!isEmpty(g.templates)) {
                        templates = Object.assign(templates, g.templates);
                        dbLocal.exeCreate("__template", templates);
                    }

                    let htmlTemplate = "<style class='core-style'>" + g.css + (g.header ? "#core-content { margin-top: " + $("#core-header-container")[0].clientHeight + "px; padding-top: " + getPaddingTopContent() + "px!important; }" : "#core-content { margin-top: 0; padding-top: " + getPaddingTopContent() + "px!important}") + "</style>" + g.content;
                    await $div.htmlTemplate(htmlTemplate);

                    if (g.cache)
                        $div.addClass("cache-content").attr("rel", file).attr("data-title", g.title).attr("data-header", g.header).attr("data-navbar", g.navbar).attr("data-js", g.js).attr("data-head", JSON.stringify(g.head));

                    if (g.navbar)
                        $("#core-header-nav-bottom").addClass("core-show-header-navbar");
                    else
                        $("#core-header-nav-bottom").removeClass("core-show-header-navbar");

                    $div.css("min-height", getPageContentHeight());
                    if ($div.attr("id") === "core-content")
                        $div.css("padding-top", getPaddingTopContent());

                    /**
                     * add script to page
                     */
                    if (!isEmpty(g.js)) {
                        for (let js of g.js)
                            await $.cachedScript(js);
                    }

                    /**
                     * Register SSE
                     */
                    if (isOnline() && typeof (EventSource) !== "undefined") {
                        if (typeof sseSourceListeners[file] === "undefined") {
                            sseSourceListeners[file] = [$div, htmlTemplate, g.js];
                            addSseEngineListener(file.split("/")[0], async function (e) {
                                let response = null;

                                if(typeof e === "object" && !isEmpty(e) && e.constructor === Object)
                                    response = e;
                                else if (typeof e.data === "string" && e.data !== "" && isJson(e.data))
                                    response = JSON.parse(e.data);

                                if(response) {
                                    /**
                                     * For each SSE received on view
                                     */
                                    for (let v in response) {
                                        if (response[v].response === 1) {

                                            /**
                                             * Store the value of the SSE event
                                             */
                                            SSE[v] = response[v].data;

                                            /**
                                             * If have event function on receive this SSE to trigger
                                             */
                                            if (typeof sseEvents[v] === "function")
                                                sseEvents[v](SSE[v]);
                                        }
                                    }

                                    /**
                                     * Update Registered Template
                                     */
                                    if (file === app.file)
                                        _updateTemplateRealTime();
                                }
                            });
                        } else {
                            sseSourceListeners[file] = [$div, htmlTemplate, g.js];
                        }
                    }

                    app.removeLoading();
                } else {
                    if (USER.setor === 0 && !localStorage.redirectOnLogin)
                        localStorage.redirectOnLogin = file;
                    location.href = HOME + (HOME !== SERVER ? "index.html?url=" : "") + g.redirect
                }
            } else {
                $div.html("");
                app.removeLoading()
            }
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
    let reload = typeof route === "undefined";
    let isGridView = typeof history.state !== "undefined" && history.state !== null && typeof history.state.type === "string" && history.state.type === "grid";
    param = (typeof param === "object" && param !== null && param.constructor === Object ? param : {});
    param.url = [];

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
    scroll = isNumberPositive(scroll) ? parseInt(scroll) : document.documentElement.scrollTop;
    setHistory = typeof setHistory === "undefined" || ["false", "0", 0, !1].indexOf(setHistory) === -1;
    replaceHistory = typeof replaceHistory !== "undefined" && ["true", "1", 1, !0].indexOf(replaceHistory) > -1;
    let file = route === "" ? "index" : route;
    let novaRota = type !== "route" || route !== app.route;
    app.route = route;
    app.file = file;

    if (!app.loading && !aniTransitionPage) {
        return _pageTransition(type, animation, target, param, scroll, setHistory, replaceHistory, novaRota, isGridView, reload);
    } else {
        return new Promise(s => {
            let a = setInterval(function () {
                if (!app.loading && !aniTransitionPage) {
                    s(_pageTransition(type, animation, target, param, scroll, setHistory, replaceHistory, novaRota, isGridView, reload));
                    clearInterval(a);
                }
            }, 10);
        });
    }
}

/**
 * @param type
 * @param animation
 * @param target
 * @param param
 * @param scroll
 * @param setHistory
 * @param replaceHistory
 * @param novaRota
 * @param isGridView
 * @param reload
 * @returns {Promise<unknown[]>}
 * @private
 */
async function _pageTransition(type, animation, target, param, scroll, setHistory, replaceHistory, novaRota, isGridView, reload) {
    clearPage();

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
            scroll: scroll
        }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
    else if (setHistory)
        history.replaceState({
            id: history.state.id,
            route: history.state.route,
            type: history.state.type,
            target: history.state.target,
            param: history.state.param,
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
                scroll: 0
            }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
        } else {
            history.pushState({
                id: historyPosition++,
                route: app.route,
                type: type,
                target: target,
                param: param,
                scroll: 0
            }, null, HOME + (HOME === "" && HOME !== SERVER ? "index.html?url=" : "") + app.route);
        }
    }

    return Promise.all([]).then(async () => {

        if (typeof destruct === "function")
            destruct();

        if (historyReqPosition)
            animation = "none";

        let $page = window["animate" + ucFirst(animation)](target, app.file, scroll);

        if (type === 'route') {
            return app.applyView(app.file, $page)
        } else if (type === 'grid') {

            //if gridCrud not exist, await until its load
            if (typeof gridCrud !== "function")
                await new Promise(s => rrr = setInterval(() => {
                    if (typeof gridCrud === "function") {
                        clearInterval(rrr);
                        s(1);
                    }
                }, 20));

            $page.grid(history.state.route)
        } else if (type === 'report') {

            //if reportTable not exist, await until its load
            if (typeof reportTable !== "function")
                await new Promise(s => rrr = setInterval(() => {
                    if (typeof reportTable === "function") {
                        clearInterval(rrr);
                        s(1);
                    }
                }, 20));

            $page.reportTable(history.state.route)
        } else if (type === 'form') {

            //if formCrud not exist, await until its load
            if (typeof formCrud !== "function")
                await new Promise(s => rrr = setInterval(() => {
                    if (typeof formCrud === "function") {
                        clearInterval(rrr);
                        s(1);
                    }
                }, 20));

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

function goLinkPageTransition(url, $this, e) {
    if (url === "#back") {
        e.preventDefault();
        history.back();
    } else {
        let animation = $this.data("animation") || "forward";
        let target = $this.data("target") || "#core-content";
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
        return AJAX.post("setUserData", updates);
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
var sseSource = {};
var sseEngineAjax = null;
const sseSourceListeners = {};
const sseEvents = {};
const SSE = {};

async function sseStart() {
    if (isUsingSSE()) {
        sseSource = new EventSource(SERVER + "get/sseEngineEvent/maestruToken/" + USER.token, {withCredentials: true});
    } else {
        sseEngineAjax = setInterval(function () {
            AJAX.get("sseEngine").then(receiveSseEngineAjax);
        }, 2000);
    }

    addSseEngineListener('base', async function (e) {
        let sseData = null;

        if(typeof e === "object" && !isEmpty(e) && e.constructor === Object)
            sseData = e;
        else if (typeof e.data === "string" && e.data !== "" && isJson(e.data))
            sseData = JSON.parse(e.data);

        if(sseData) {
            /**
             * If have event function on receive this SSE to trigger
             */
            for (let i in sseData) {
                if (sseData[i].response === 1) {
                    /**
                     * Store the value of the SSE event
                     */
                    SSE[i] = sseData[i].data;

                    /**
                     * For each SSE received on view
                     */
                    if (typeof sseEvents[i] === "function")
                        sseEvents[i](SSE[i]);
                }
            }
        }
    });

    /**
     * Listen for database local updates
     */
    addSseEngineListener('db', async function (e) {
        let sseData = null;

        if(typeof e === "object" && !isEmpty(e) && e.constructor === Object)
            sseData = e;
        else if (typeof e.data === "string" && e.data !== "" && isJson(e.data))
            sseData = JSON.parse(e.data);

        if(sseData && !isEmpty(sseData) && sseData.constructor === Object) {
            for (let entity in sseData) {
                for(let content of sseData[entity]) {
                    if(isNumberPositive(content)) {
                        await dbLocal.exeDelete(entity, content);
                    } else if (!isEmpty(content) && typeof content === "object" && content !== null && content.constructor === Object) {
                        await dbLocal.exeCreate(entity, content);
                    }
                }

                _checkRealtimeDbUpdate(entity);
            }
        }
    });

    sseAdd("updatePerfil", function (data) {
        USER = data;
        storeUser();
        _updateTemplateRealTime();
    });

    /**
     * Notificações pendentes show badge
     */
    sseAdd("notificationsBadge", async function (data) {
        if (USER.setor !== 0) {
            if (isNumberPositive(data)) {
                /**
                 * Adiciona badge notification apenas no navbar mobile e se tiver a aba de notificações
                 */
                let $navbarNotify = $("#core-header-nav-bottom").find("a[href='notificacoes']");
                if ($navbarNotify.length && !$navbarNotify.find("#badge-note").length)
                    $navbarNotify.append("<span class='badge-notification' id='badge-note'>" + data + "</span>");

            } else {
                $("#badge-note").remove();
            }
        } else {
            $("#badge-note").remove();
        }
    });
}

function isUsingSSE() {
    return isOnline() && typeof (EventSource) !== "undefined" && HOME === SERVER;
}

async function addSseEngineListener(name, funcao) {
    if (isUsingSSE())
        sseSource.addEventListener(name, funcao, !1);
    else
        sseSource[name] = funcao;
}

async function receiveSseEngineAjax(data) {
    for(let n in data) {
        if (typeof sseSource[n] === "function" && !isEmpty(data[n]))
            await sseSource[n](data[n]);
    }
}

function sseAdd(name, funcao) {
    if (typeof funcao === "function")
        sseEvents[name] = funcao;
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

    window.oncontextmenu = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        openInstallAppPrompt();
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

        if (window.innerWidth < 994)
            updateHeaderPosition();
    };

    /**
     * Intercepta clicks em links e traduz na função "pageTransition()"
     */
    $("body").off("mousedown", "a").on("mousedown", "a", function () {
        timeWaitClick = ($("input, textarea").is(':focus') ? 200 : 0);

    }).off("click", "a").on("click", "a", function (e) {
        let $this = $(this);
        let url = $this.attr("href").replace(HOME, '').replace(SERVER, '');

        if ($this.hasClass("notification-title"))
            setNotificationOpen($this.data("id"));

        if (timeWaitClick > 0) {
            if ($this.attr("target") !== "_blank" && !$this.hasAttr("data-preventDefault")) {
                e.preventDefault();
                setTimeout(function () {
                    goLinkPageTransition(url, $this, e);
                }, timeWaitClick);
            }
        } else if (!$this.hasAttr("data-preventDefault")) {
            goLinkPageTransition(url, $this, e);
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
    sseStart();
    await updateAppOnDev();
    await menuHeader();
    await readRouteState();
    await onLoadDocument();

    await (!localStorage.accesscount ? firstAccess() : thenAccess());

    setTimeout(function () {
        checkUpdate();
    }, 1000);

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

async function setServiceWorker(swReg) {
    swRegistration = swReg;

    if (USER.setor !== "0" && swRegistration.active)
        return swRegistration.active.postMessage(JSON.stringify({token: USER.token, version: VERSION}));
}

$(function () {
    (async () => {
        if (SERVICEWORKER && isOnline()) {
            if (navigator.serviceWorker.controller) {
                await navigator.serviceWorker.ready.then(setServiceWorker);
            } else {
                await navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION).then(setServiceWorker);
            }
        }

        if (isMobile() && screen.orientation && typeof screen.orientation.lock === "function")
            screen.orientation.lock('portrait').catch(e => {});

        await startApplication();
    })();
});