function isMobile() {
    let c = !1;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            c = !0;

        c = (c && (typeof Notification === "undefined" || typeof Notification.permission === "undefined"));
    })(navigator.userAgent || navigator.vendor || window.opera);
    return c;
}

function isBuild() {
    return !SERVICEWORKER && HOME === "";
}

function dateFormat(date) {
    let dateObj = new Date(date || Date.now());
    let day = String(dateObj.getDate()).padStart(2, '0');
    let month = String(dateObj.getMonth() + 1).padStart(2, '0');
    let year = dateObj.getFullYear();
    return day + '/' + month  + '/' + year;
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
 * Social share class
 * to use in cordova and web
 */
class SocialShare {
    static whatsapp(message, url) {
        if (isBuild() && isMobile()) {
            if (window.plugins.socialsharing.canShareVia('whatsapp', 'msg')) {
                window.plugins.socialsharing.shareViaWhatsApp(message, null /* img */, url /* url */)
            } else {
                var options = {
                    message: message, // not supported on some apps (Facebook, Instagram)
                    subject: message, // fi. for email
                    url: url,
                    chooserTitle: message, // Android only, you can override the default share sheet title
                };
                window.plugins.socialsharing.shareWithOptions(options);
            }
        } else {
            window.location.href = "//api.whatsapp.com/send?text=" + message + ": " + url;
        }
    }
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
    while(arr.length && (obj = obj[arr.shift()]));
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
    if(!isEmpty(txtRender)) {
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
     * @returns {Promise<void>}
     */
    $.fn.htmlTemplate = function (tpl, param, includeTpls, isRefresh) {
        let $this = this;
        isRefresh = typeof isRefresh !== "undefined";
        includeTpls = typeof includeTpls === "object" && includeTpls.constructor === Array ? includeTpls : {};
        let includes = {};
        for (let i in includeTpls)
            includes[includeTpls[i]] = templates[includeTpls[i]];

        if(!sseTemplate.length)
            sseTemplate = [$this, tpl, includes];

        return (async () => {
            param = typeof param === "object" && param !== null ? param : [];
            let templates = await getTemplates();
            let templateTpl = tpl.length > 100 || typeof templates[tpl] === "undefined" ? tpl : templates[tpl];
            let isSkeleton = isEmpty(param);
            let loop = $this.hasAttr('data-template-loop') ? parseInt($this.data("template-loop")) : 2;

            /**
             * If not defined param, so check skeleton
             */
            if (isSkeleton) {
                /**
                 * Find arrays
                 */
                let loo = templateTpl.split("{{#");
                if (loo.length) {
                    param = [];
                    for (let i in loo) {
                        if (i > 0) {
                            let p = loo[i].split("}}")[0];
                            if (p === ".") {
                                for (let e = 0; e < loop; e++)
                                    param.push([]);
                            } else if (!/(^is\w+|\.is\w+|ativo|status|active)/.test(p)) {
                                let vp = [];
                                for (let e = 0; e < loop; e++) {
                                    if(typeof param[e] === "undefined")
                                        param.push([]);

                                    vp.push({});
                                }

                                for (let e = 0; e < loop; e++)
                                    param[e].push(createObjectWithStringDotNotation(p, vp));
                            }
                        }
                    }
                }

                /**
                 * Find content to add class skeleton
                 */
                loo = templateTpl.split("{{");
                if (loo.length) {
                    templateTpl = "";
                    for (let i in loo) {
                        if (i > 0) {
                            let p = loo[i];
                            let a = loo[i - 1].trim();
                            if (/(^\w|{)/.test(p) && !/^(USER\.|sitename)/.test(p)) {
                                if (/>[\w$\s]*$/.test(a))
                                    a = a.replace(/>[\w$\s]*$/, " data-skeleton='1'>");
                                else if (/ src=("|')$/.test(a))
                                    a = a.replace(/ src=("|')$/, " data-skeleton='1' src=" + (/'$/.test(a) ? "'" : '"'));
                            }
                            templateTpl += a + "{{";
                        }
                    }
                    templateTpl += loo[loo.length - 1];
                }

                /**
                 * Image error back to loading png default
                 */
                templateTpl = templateTpl.replace(/<img /gi, "<img onerror=\"this.src='" + HOME + "assetsPublic/img/loading.png'\"");

            } else {
                /**
                 * Image error set default img
                 */
                templateTpl = templateTpl.replace(/<img /gi, "<img onerror=\"this.src='" + HOME + "assetsPublic/img/img.png'\"");
            }

            mergeObject(param, {
                home: HOME,
                vendor: VENDOR,
                favicon: FAVICON,
                logo: LOGO,
                theme: THEME,
                themetext: THEMETEXT,
                sitename: SITENAME,
                USER: USER,
                URL: history.state.param.url,
                jsonParse: function () {
                    return function(txt, render) {
                        return _htmlTemplateJsonDecode(txt, render);
                    }
                },
                jsonDecode: function() {
                    return function(txt, render) {
                        return _htmlTemplateJsonDecode(txt, render);
                    }
                }
            });
            mergeObject(param, SSE);

            let $content = $("<div>" + Mustache.render(templateTpl, param, includes) + "</div>");

            if(isRefresh) {
                /**
                 * First Compile templates inside the base template
                 */
                let $templatesToRenderInside = $content.find("[data-template]");
                if($templatesToRenderInside.length) {
                    await new Promise(async s => {
                        $templatesToRenderInside.each(async function () {
                            let $this = $(this);
                            let results = [];
                            if($this.hasAttr("data-get")) {
                                results = await AJAX.get($this.data("get"));
                            } else if($this.hasAttr("data-db")) {

                                let entity = Mustache.render($this.data("db"), param);
                                let id = (isNumberPositive($this.data("id")) ? Mustache.render($this.data("id"), param) : (isJson($this.data("id")) ? JSON.parse(Mustache.render($this.data("id"), param)) : null));
                                let limit = Mustache.render($this.data("limit"), param);
                                let offset = Mustache.render($this.data("offset"), param);
                                let order = Mustache.render($this.data("order"), param);
                                let orderReverse = ($this.hasAttr("order") ? $this.data("order") : null);

                                results = await db.exeRead(entity, id, limit, offset, order, orderReverse);
                            }

                            s($this.htmlTemplate($this.data("template"), (!isEmpty(results) ? results: {home: HOME})));
                        });
                    });
                }

            } else if (isSkeleton) {
                $content.find("[data-skeleton='1']").addClass("skeleton");

                /**
                 * Await Compile templates inside the base template to render all together
                 */
                let $templatesToRenderInside = $content.find("[data-template]");
                if($templatesToRenderInside.length) {
                    await new Promise(async s => {
                        $templatesToRenderInside.each(async function () {
                            s($(this).htmlTemplate($(this).data("template")));
                        });
                    });
                }

                $this.html($content.html());

                /**
                 * Find data declaration on DOM attr to load on template and replace skeleton
                 */
                if($templatesToRenderInside.length) {
                    $templatesToRenderInside.each(async function () {
                        let $this = $(this);
                        if($this.hasAttr("data-get")) {
                            let results = await AJAX.get($this.data("get"));
                            if(!isEmpty(results))
                                $this.htmlTemplate($this.data("template"), results);
                        } else if($this.hasAttr("data-db")) {
                            let entity = Mustache.render($this.data("db"), param);
                            let id = (isNumberPositive($this.data("id")) ? Mustache.render($this.data("id"), param) : (isJson($this.data("id")) ? JSON.parse(Mustache.render($this.data("id"), param)) : null));
                            let limit = Mustache.render($this.data("limit"), param);
                            let offset = Mustache.render($this.data("offset"), param);
                            let order = Mustache.render($this.data("order"), param);
                            let orderReverse = ($this.hasAttr("order") ? $this.data("order") : null);

                            let results = await db.exeRead(entity, id, limit, offset, order, orderReverse);
                            if(!isEmpty(results))
                                $this.htmlTemplate($this.data("template"), results);
                        }
                    });
                }
            }

            if(!isSkeleton) {
                /**
                 * await for load images on content before change the content
                 */
                let awaitImagesLoad = [];
                $content.find("img").each(function() {
                    awaitImagesLoad.push($(this).attr("src"));
                });
                $content.find("[style*='background-image']").each(function() {
                    awaitImagesLoad.push($(this).css("background-image").replace('url(', '').replace(')', '').replace("'", '').replace("'", '').replace('"', '').replace('"', ''));
                });

                /**
                 * Await load images to not flickering
                 */
                await imagesPreload(awaitImagesLoad);
                $this.append($content.addClass("loadingImagesPreview").css({"visibility": "hidden", "position": "fixed"}));
                setTimeout(function () {
                    $this.children().not(".loadingImagesPreview").remove();
                    $content.css({"visibility": "visible", "position": "relative"}).removeClass("loadingImagesPreview");
                }, 500);
            }

            return $this;
        })();
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

        new TouchHorizontal($gallery, 0, 0, 20, function(touch, target, direction) {
            let next = direction === "right";
            let img = $gallery.attr("src");
            let imgBefore = !1;
            let now = !1;
            $images.each(function(i, e) {
                if(now && next) {

                    /**
                     * Next Slide
                     */
                    $gallery.attr("src", $(e).attr("src")).load(function() {
                        $gallery.css("top", "calc(50% - " + ($gallery.height() /2) + "px")
                    });
                    return !1;
                }
                now = $(e).attr("src") === img;

                /**
                 * Back Slide
                 */
                if(now && imgBefore && !next) {
                    $gallery.attr("src", imgBefore).load(function() {
                        $gallery.css("top", "calc(50% - " + ($gallery.height() /2) + "px")
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
    if (swRegistration && swRegistration.pushManager) {
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
    } else {
        $(".site-btn-push").remove();
        toast("Desculpa! Seu aparelho não tem suporte.", "toast-warning", 2500);
    }
}

function updateSubscriptionOnServer(subscription, showMessageSuccess) {
    if (subscription && USER.setor !== 0 && typeof USER.setor === "string" && USER.setor !== "0" && !isEmpty(USER.setor)) {
        AJAX.post('push', {
            "push": JSON.stringify(subscription),
            'p1': navigator.appName,
            'p2': navigator.appCodeName,
            'p3': navigator.platform
        }).then(() => {
            if (!showMessageSuccess)
                pushNotification("Parabéns " + USER.nome, "A partir de agora, você receberá notificações importantes!");
        })
    }
}

async function checkUpdate() {
    if (navigator.onLine && SERVICEWORKER) {
        if (!localStorage.update)
            localStorage.update = await AJAX.post("update");
        else if (VERSION > parseFloat(localStorage.update))
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
    if (navigator.onLine) {
        toast("Saindo...", 42000);
        await AJAX.get("logout");
        await setCookieAnonimo();
        location.href = HOME;
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

    if (typeof tpl.header === "undefined")
        return updateCache();

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
        if (history.state.route !== entity || history.state.type !== "form")
            pageTransition(entity, 'form', 'forward', ".main > .container", id);
    }).off("click", ".btn-login").on("click", ".btn-login", function () {
        if (USER.setor != 0)
            logoutDashboard();
        else
            pageTransition("login", "route", "forward", "#core-content", null, null, !1);
    });

    /**
     * Verifica se remove o botão de Notificação
     * */
    if ((swRegistration && !swRegistration.pushManager) || localStorage.token === "0" || typeof Notification === "undefined" || Notification.permission !== "default" || PUSH_PUBLIC_KEY === "")
        $(".site-btn-push").remove();

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
    if (navigator.onLine && typeof type === "string") {
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
                                return getRelevantTitle(e.relation, d, 1, etiqueta).then(ff => {
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

function clearCacheUser() {
    let clear = [];
    localStorage.removeItem("accesscount");

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    for (let entity in dicionarios) {
        clear.push(dbLocal.exeRead("sync_" + entity).then(d => {
            if (!d.length)
                return;

            AJAX.post("up/sync", {entity: entity, dados: d});
            return dbLocal.clear("sync_" + entity)
        }).then(() => {
            return dbLocal.clear(entity);
        }));
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

function clearCacheAll() {
    localStorage.removeItem('update');
    localStorage.removeItem('accesscount');

    /**
     * Sobe pendências para o servidor e limpa base local
     */
    let clear = [];
    for (let entity in dicionarios) {
        clear.push(dbLocal.exeRead("sync_" + entity).then(d => {
            if (!d.length)
                return;

            AJAX.post("up/sync", {entity: entity, dados: d});
            return dbLocal.clear("sync_" + entity)
        }).then(() => {
            return dbLocal.clear(entity);
        }));
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
    if (navigator.onLine) {
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

function setUserInNavigator(user, isUserToStore) {
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
        return loadCacheUser();
    }
}

function setCookieAnonimo() {
    let token = Date.now() + Math.floor((Math.random() * 100000) + 1);
    return setCookieUser({token: "T!" + token, id: (token*-1), nome: 'Anônimo', imagem: '', setor: 0});
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
    if (navigator.onLine) {
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
    if (navigator.onLine) {

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

/**
 * Verifica se tem notificações pendentes
 * @returns {Promise<void>}
 */
async function updateNotificationsBadge() {
    if ($("#core-header-nav-bottom").find("a[href='notificacoes']").length && USER.setor !== 0) {
        if (typeof (EventSource) !== "undefined" && HOME !== "" && HOME === SERVER) {
            let notefications = new EventSource(SERVER + "get/event/notifications_badge", {withCredentials: true});
            notefications.onmessage = function (event) {
                $("#core-header-nav-bottom").find("a[href='notificacoes']").find(".badge-notification").remove();
                pendentes = event.data;

                /**
                 * Adiciona badge notification apenas no navbar mobile e se tiver a aba de notificações
                 */
                if (pendentes !== "0")
                    $("#core-header-nav-bottom").find("a[href='notificacoes']").append("<span class='badge-notification'>" + pendentes + "</span>");
            };
        } else {
            setInterval(function () {
                let pendentes = 0;
                db.exeRead("notifications_report").then(notifications => {
                    $("#core-header-nav-bottom").find("a[href='notificacoes']").find(".badge-notification").remove();
                    if (!isEmpty(notifications)) {
                        for (let i in notifications) {
                            if (notifications[i].recebeu === 0)
                                pendentes++
                        }
                        if (pendentes !== 0)
                            $("#core-header-nav-bottom").find("a[href='notificacoes']").append("<span class='badge-notification'>" + pendentes + "</span>");
                    }
                });
            }, 3000);
        }
    }
}

async function closeNote(id, notification) {

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
    await db.exeDelete("notifications_report", id);

    /**
     * Revisa os badge para atualizar as notificações pendentes
     */
    $(".badge-notification").each(function (i, e) {
        let n = parseInt($(e).text());
        if (n === 1)
            $(e).remove();
        else
            $(e).text(n - 1);
    });

    /**
     * Check if some notification report use the notification
     * case not, delete notification not used
     */
    let note = await getJSON(SERVER + "app/find/notifications_report/notificacao/" + notification);
    if (isEmpty(note.notifications_report))
        await db.exeDelete("notifications", notification);
}

function getNotche(side) {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sa" + side.substring(0, 1)));
}

function errorLoadingApp(id, e) {
    console.log(e);
    toast("Erro ao carregar Aplicativo [" + id + "]", 3000, "toast-warning");
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

    return Promise.all(clear);
}

async function getIndexedDbGets() {
    let r = await AJAX.get("userCache");

    dicionarios = r['dicionario'];
    if(USER.setor === "admin") {
        let inputTypes = await get("inputTypes");
        for(let entity in dicionarios) {
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
    return dbLocal.exeCreate('__graficos', r['graficos']);
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

async function thenAccess() {
    /**
     * Conta acesso
     */
    localStorage.accesscount = parseInt(localStorage.accesscount) + 1;

    /**
     * Check if have permission to send notification but not is registered on service worker
     * */
    if (USER.setor !== 0 && PUSH_PUBLIC_KEY !== "" && swRegistration && swRegistration.pushManager) {
        swRegistration.pushManager.getSubscription().then(function (subscription) {
            if (subscription === null) {
                return swRegistration.pushManager.permissionState({userVisibleOnly: !0}).then(p => {
                    if (p === "granted")
                        return subscribeUser(1);
                });
            } else {
                AJAX.post('push', {
                    "push": JSON.stringify(subscription),
                    'p1': navigator.appName,
                    'p2': navigator.appCodeName,
                    'p3': navigator.platform
                });
            }
        });
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
    $element.css({
        "min-height": getPageContentHeight(),
        "position": "fixed",
        "top": $element[0].getBoundingClientRect().top + "px",
        "width": $element[0].clientWidth + "px",
        "left": left + "px",
        "overflow": "hidden"
    });

    let file = app.file.split("/");
    file = file[0];

    let $aux = null;
    let topHeader = $("#core-header").css("opacity") !== "0" ? $("#core-header")[0].clientHeight : 0;
    if ($(".cache-content[rel='" + route + "']").length) {
        $aux = $(".cache-content[rel='" + route + "']").removeClass("hide").css({"top": topHeader + "px"});
    } else {
        $aux = $("<section />").css({
            "top": topHeader + "px",
            "padding-top": getPaddingTopContent() + "px"
        }).addClass("core-class-container r-network r-403 r-" + file).data("file", file).insertBefore($element);
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
                $aux.animate({left: left + "px", opacity: 1}, 150, () => {
                    animateTimeout($element, $aux, 0)
                });
                $element.animate({left: (left - 100) + "px", opacity: 0}, 100)
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
            $aux.css("top", (- (scroll - topHeader)) + "px");
            if (window.innerWidth < 900) {
                $aux.animate({left: '0'}, 250, () => {
                    animateTimeout($element, $aux, scroll);
                });
                $element.css("z-index", -1).animate({left: '30%'}, 250)
            } else {
                $aux.animate({left: left + 'px', opacity: 1}, 150, () => {
                    animateTimeout($element, $aux, scroll)
                });
                $element.animate({opacity: 0}, 100);
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
 * Fetch images before add to HTML on view
 * @param imagesList
 * @returns {Promise<unknown[]>}
 */
async function imagesPreload(imagesList) {
    let loadAll = [];
    for(let image of imagesList) {
        loadAll.push(new Promise(s => {
            let img = new Image();
            img.onload = function () {
                s(1);
            };
            img.src = image;
        }));

    }
    return Promise.all(loadAll);
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
                    sseTemplate = [];
                    TITLE = g.title;
                    headerShow(g.header);
                    checkMenuActive();
                    $("#core-title").text(g.title);

                    let templates = await getTemplates();
                    URL = history.state.param.url;

                    /**
                     * Include templates used in this view
                     */
                    if(!isEmpty(g.templates)) {
                        templates = Object.assign(templates, g.templates);
                        dbLocal.exeCreate("__template", templates);
                    }

                    await $div.htmlTemplate("<style class='core-style'>" + g.css + (g.header ? "#core-content { margin-top: " + $("#core-header-container")[0].clientHeight + "px; padding-top: " + getPaddingTopContent() + "px!important; }" : "#core-content { margin-top: 0; padding-top: " + getPaddingTopContent() + "px!important}") + "</style>" + g.content);

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
                     * add tags to the head of the page
                     * if allready exist, so not do anything
                     */
                    $("html").removeClass();
                    if (!isEmpty(g.head)) {
                        /**
                         * Add link to head
                         */
                        for (let hid in g.head) {
                            if(/^core-/.test(hid))
                                $("html").addClass(hid);
                            else
                                $div.addClass(hid);

                            if (!$("head > #" + hid).length)
                                $(g.head[hid]).appendTo("head");
                        }
                    }

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
                    if(navigator.onLine && typeof (EventSource) !== "undefined") {
                        await AJAX.get("sseEngineClear");
                        if(typeof sseSourceListeners[file] === "undefined") {
                            sseSourceListeners[file] = 1;
                            sseSource.addEventListener(file, function (e) {
                                if (typeof e.data === "string" && e.data !== "" && isJson(e.data)) {
                                    let response = JSON.parse(e.data);

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
                                    sseTemplate[0].htmlTemplate(sseTemplate[1], Object.assign({}, SSE[file]), sseTemplate[2], !0);
                                }
                            }, !1);
                        }
                    }

                    app.removeLoading();
                } else {
                    if (USER.setor === 0 && !localStorage.redirectOnLogin)
                        localStorage.redirectOnLogin = file;
                    location.href = HOME + g.redirect
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
                if(!app.loading && !aniTransitionPage) {
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

                /**
                 * Back form after save if is in grid view
                 */
                if(isGridView) {
                    form.setFuncao(function () {
                        if(formNotHaveError(form.error))
                            history.back();
                    });
                }
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
    if(typeof value !== "undefined" && typeof field === "string" && dicionarios[USER.setor][field]) {
        /**
         * one field and one value
         */
        USER.setorData[field] = value;
        updates[field] = value;

    } else if(typeof field === "object" && field !== null && field.constructor === Object && typeof value === "undefined") {
        /**
         * One object
         */
        for(let c in field) {
            if(typeof c === "string" && typeof field[c] !== "undefined" && dicionarios[USER.setor][c]) {
                USER.setorData[c] = field[c];
                updates[c] = field[c];
            }
        }

    } else if(typeof field === "object" && field !== null && field.constructor === Array && typeof value === "object" && value !== null && value.constructor === Array) {
        /**
         * Two arrays, first is fields, second is values
         */
        for(let i in field) {
            if(typeof field[i] === "string" && typeof value[i] !== "undefined" && dicionarios[USER.setor][field[i]]) {
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
    if(navigator.onLine)
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
async function updatedPerfil() {
    if (navigator.onLine) {
        if (typeof (EventSource) !== "undefined" && HOME !== "" && HOME === SERVER) {
            let u = new EventSource(SERVER + "get/event/updatePerfil/maestruToken/" + USER.token, {withCredentials: true});
            u.onmessage = function (event) {
                if (typeof event.data === "string" && event.data !== "" && isJson(event.data)) {
                    USER = JSON.parse(event.data);
                    storeUser();
                }
            };
        } else {
            setInterval(function () {
                AJAX.getUrl(SERVER + "get/event/updatePerfilAjax").then(u => {
                    if (u.data !== "" && typeof u.data === "string" && isJson(u.data)) {
                        USER = JSON.parse(u.data);
                        storeUser();
                    }
                });
            }, 3000);
        }
    } else {
        let checkUpdatePerfilOffline = setInterval(function () {
            if (navigator.onLine) {
                clearInterval(checkUpdatePerfilOffline);
                updatedPerfil();
            }
        }, 2000);
    }
}

/**
 * Get user profile in server to update local
 * @returns {Promise<void>}
 */
var sseTemplate = [];
var sseSource = {};
const sseSourceListeners = {};
const sseEvents = {};
const SSE = {};
async function sseStart() {
    if (navigator.onLine && typeof (EventSource) !== "undefined") {
        sseSource = new EventSource(SERVER + "get/sseEngine/maestruToken/" + USER.token, {withCredentials: true});
        sseSource.addEventListener('base', function (e) {
            if (typeof e.data === "string" && e.data !== "" && isJson(e.data)) {
                let sseData = JSON.parse(e.data);

                /**
                 * If have event function on receive this SSE to trigger
                 */
                for(let i in sseData) {
                    if(sseData[i].response === 1) {
                        /**
                         * Store the value of the SSE event
                         */
                        SSE[i] = sseData[i].data;

                        /**
                         * For each SSE received on view
                         */
                        if(typeof sseEvents[i] === "function")
                            sseEvents[i](SSE[i]);
                    }
                }
            }
        }, !1);

        sseAdd("updatePerfil", function(data) {
            USER = data;
            storeUser();
        });
    }
}

function sseAdd(name, funcao) {
    if(typeof funcao === "function")
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
        let url = $this.attr("href").replace(HOME, '');

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

    /**
     * Busca notificações pendentes
     */
    if (USER.setor !== 0) {
        let allow = await dbLocal.exeRead("__allow", 1);
        if (allow.notifications_report && allow.notifications_report.read)
            await updateNotificationsBadge();
    }
}

async function startApplication() {
    await checkSessao();
    sseStart();
    await updateAppOnDev();
    await menuHeader();
    await readRouteState();
    await onLoadDocument();

    await (!localStorage.accesscount ? firstAccess() : thenAccess());
    // await updatedPerfil();

    if (localStorage.accesscount === "1") {

        /**
         * Recupera syncs pendentes deste usuário
         */
        loadSyncNotSaved();

        if (SERVICEWORKER && HOME !== "" && HOME === SERVER) {
            setTimeout(function () {
                checkUpdate();
            }, 1000);
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
        if (SERVICEWORKER && navigator.onLine) {
            if (navigator.serviceWorker.controller) {
                await navigator.serviceWorker.ready.then(setServiceWorker);
            } else {
                await navigator.serviceWorker.register(HOME + 'service-worker.js?v=' + VERSION).then(setServiceWorker);
            }
        }

        if (isMobile() && screen.orientation && screen.orientation.lock)
            screen.orientation.lock('portrait');

        await startApplication();
    })();
});