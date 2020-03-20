var form = {};
var checkformSaved = !1;

$(function ($) {
    $.fn.form = function (entity, id, fields, parent, parentColumn, store, callback) {
        if(typeof entity === "string") {
            fields = typeof fields === "object" && fields !== null && fields.constructor === Array && fields.length ? fields : null;
            let data = (typeof id === "object" ? id : null);
            id = (typeof id !== "undefined" && !isNaN(id) ? parseInt(id) : null);

            form = formCrud(entity, this, parent, parentColumn, store);

            if (typeof callback === "function")
                form.setFuncao(callback);

            if(data)
                form.setData(data);

            form.show(id, fields);
        }

        return this
    }

    clearMarginFormInput();
    $("#app").off("change click", ".formCrudInput, button").on("change click", ".formCrudInput, button", function () {
        clearMarginFormInput()
    })
}, jQuery);

function clearMarginFormInput() {
    $(".parent-input").parent().addClass("margin-bottom padding-tiny");
    $(".parent-input.hide").parent().removeClass("margin-bottom padding-tiny")
}

$("#app").off("keyup change", ".formCrudInput").on("keyup change", ".formCrudInput", function (e) {
    let $input = $(this);
    if ($input.attr("rel") !== "undefined" && typeof form === "object" && form.identificador === $input.attr("rel")) {
        let column = $input.data("column");
        let format = $input.data("format");
        let parent = $input.data("parent");
        let value = null;
        let data = {};
        let dicionario = dicionarios[form.entity];
        if (form.entity !== parent) {
            parent = parent.replace(form.entity + ".", "");
            if (parent.indexOf(".") !== -1) {
                $.each(parent.split('.'), function (i, e) {
                    dicionario = dicionarios[dicionario[e].relation]
                })
            } else {
                dicionario = dicionarios[dicionario[parent].relation]
            }
            fetchCreateObject(form.data, parent + "." + column);
            data = fetchFromObject(form.data, parent)
        } else {
            data = form.data
        }
        if (['checkbox', 'radio'].indexOf(format) > -1)
            $(".error-support[rel='" + column + "-" + parent + "']").remove(); else $input.css("border-bottom-color", "#999");
        $input.parent().parent().parent().find(".input-message").html("");
        if (format === "checkbox") {
            value = [];
            let max = ($input.data("max") === "false" ? 1000 : parseInt($input.data("max")));
            max = isNaN(max) ? 1000 : max;
            let v = $input.val().toString();
            if (max > 0) {
                if ($input.is(":checked"))
                    value.push(v.toString());
                form.$element.find("input[name='" + column + "']").each(function (i, e) {
                    if ($(this).is(":checked")) {
                        if (value.length < max && value.indexOf($(this).val().toString()) === -1) {
                            value.push($(this).val().toString())
                        } else if ($(this).val().toString() !== v) {
                            $(this).prop("checked", !1)
                        }
                    }
                })
            }
        } else if (format === "radio") {
            value = form.$element.find("input[name='" + column + "']:checked").val()
        } else if (format === "source" || format === "source_list") {
            value = !$.isArray(data[column]) ? [] : data[column];
            let entity = $input.data("entity");
            let max = parseInt($input.attr("max"));
            let now = value.length;
            if (typeof e.target.files[0] !== "undefined" && now < max) {
                $.each(e.target.files, function (e, file) {
                    if (now < max) {
                        now++;
                        let loading = createSource({
                            name: 'Carregando',
                            nome: '',
                            sizeName: '',
                            size: 1,
                            url: HOME + "assetsPublic/img/loading." + webp("gif") + "?v=" + VERSION,
                            isImage: !0,
                            icon: ""
                        }, $input, (dicionarios[entity][column].format === "source_list" ? 1 : 2));
                        $input.siblings(".file_gallery").find(".file-more").addClass("hide");
                        $input.parent().siblings(".info-container").find(".input-info").html(now);
                        let name = file.name.split(".");
                        let extensao = name.pop().toLowerCase();
                        name = name.join('-');
                        let nome = replaceAll(replaceAll(name, '-', ' '), '_', ' ');
                        name = slug(name);
                        if (/^image\//.test(file.type)) {
                            compressImage(file, 1920, 1080, webp("jpg"), function (resource) {
                                var size = parseFloat(4 * Math.ceil(((resource.length - 'data:image/png;base64,'.length) / 3)) * 0.5624896334383812).toFixed(1);
                                let mock = createMock(resource, nome, name, webp("jpg"), "image/" + webp("jpg"), size, !0);
                                value.push(mock);
                                sendFileUpload(dataURLtoFile(mock.url, mock.name + "." + mock.type), mock, $input, entity, column, data[column], loading, now, max)
                            })
                        } else {
                            if (file.size < 4096000) {
                                let reader = new FileReader();
                                reader.readAsDataURL(file);
                                reader.onloadend = function (e) {
                                    if (e.target.error != null) {
                                        console.error("Arquivo não pode ser lido! Código " + e.target.error.code)
                                    } else {
                                        let mock = createMock(e.target.result, nome, name, extensao, file.type, file.size);
                                        value.push(mock);
                                        sendFileUpload(dataURLtoFile(mock.url, mock.name + "." + mock.type), mock, $input, entity, column, data[column], loading, now, max)
                                    }
                                }
                            } else {
                                $.ajax({
                                    type: "POST",
                                    url: HOME + 'set',
                                    data: {lib: 'entity', file: 'ping'},
                                    success: function (data) {
                                        if (data.response === 1) {
                                            let mock = createMock(!1, nome, name, extensao, file.type, file.size);
                                            value.push(mock);
                                            sendFileUpload(file, mock, $input, entity, column, data[column], loading, now, max)
                                        } else {
                                            Promise.all([loading]).then(f => {
                                                $input.siblings(".file_gallery").find("#mock-Carregando").remove();
                                                if ((now + 1) < max)
                                                    $input.siblings(".file_gallery").find(".file-more").removeClass("hide")
                                            })
                                            toast("Arquivos maiores que 4MB só podem ser enviados online.", 5000, "toast-warning")
                                        }
                                    },
                                    dataType: "json"
                                })
                            }
                        }
                    }
                })
            }
        } else if (['tel', 'cpf', 'cnpj', 'ie', 'cep', 'card_number'].indexOf(format) > -1) {
            value = $input.cleanVal()
        } else if (dicionario[column].form.input === "switch") {
            value = $input.prop("checked")
        } else if (dicionario[column].format === "list") {
            searchList($input)
        } else {
            value = $input.val()
        }
        if (dicionario[column].format !== "list") {
            data[column] = getDefaultValue(dicionario[column], value);
            if (typeof data[column] !== "number") {
                let size = (typeof data[column] === "string" || $.isArray(data[column]) ? data[column].length : 0);
                $input.siblings(".info-container").find(".input-info").html(size)
            }
        }
        if(!form.loading) {
            form.modified = !0;
            form.saved = !1;
        }

        checkRules(form.entity, column, value)
    }
    history.state.param.data = form.data;
    history.replaceState(history.state, null, HOME + app.route);

}).off("click", ".remove-file-gallery").on("click", ".remove-file-gallery", function () {
    if (confirm("Remover arquivo?"))
        removeFileForm($(this))
}).off("click", ".btn-form-list").on("click", ".btn-form-list", function () {
    form.setReloadAfterSave(!1);
    form.save(0).then(() => {
        animateBack("#dashboard").grid(form.entity)
    })
}).off("click", ".btn-form-save").on("click", ".btn-form-save", function () {
    form.save()
}).off("dblclick", ".list").on("dblclick", ".list", function () {
    searchList($(this))
}).off("click", ".switch-status-extend").on("click", ".switch-status-extend", function () {
    let column = $(this).data("column");
    let id = $(this).data("id");
    let valor = $(this).prop("checked");
    $(this).data("status", valor);
    $.each(form.data[column], function (i, e) {
        if (e.id == id) {
            e.columnStatus.value = valor;
            e[e.columnStatus.column] = valor ? 1 : 0;
            return !1
        }
    })
});

function removeFileForm($btn, tempo) {
    let $input = $btn.closest(".file_gallery").siblings("input[type='file']");
    let column = $input.data("column");
    let parent = $input.data("parent");
    let max = $input.attr("max");
    let name = $btn.attr("rel");
    if (typeof ajaxUploadProgress[name] !== "undefined") {
        clearInterval(checkUploadStoped[name]);
        ajaxUploadProgress[name].abort();
        delete (ajaxUploadProgress[name]);
        delete (checkUploadStoped[name]);
        $(".progress-wrp[rel='" + name + "'] .progress-bar").css("background-color", "#d3d3d3");
        $(".progress-wrp[rel='" + name + "'] .status").css("left", "31%").html("<span style='color:#e02d36'>CANCELADO</span>")
    }
    if (form.entity !== parent) {
        parent = parent.replace(form.entity + ".", "");
        data = fetchFromObject(form.data, parent)
    } else {
        data = form.data
    }
    if ($.isArray(data[column]) && data[column].length > 0) {
        $.each(data[column], function (id, e) {
            if (e.name === name) {
                data[column].splice(id, 1);
                $input.val("");
                $input.parent().siblings(".info-container").find(".input-info").html(data[column].length);
                if (typeof tempo === "number") {
                    setTimeout(function () {
                        $input.siblings(".file_gallery").find("#mock-" + name).remove()
                    }, tempo)
                } else {
                    $input.siblings(".file_gallery").find("#mock-" + name).remove()
                }
                if (data[column].length < max)
                    $input.siblings(".file_gallery").find(".file-more").removeClass("hide");
                return !1
            }
        })
    }
}

function checkRules(entity, column, value) {
    let find = !1;
    $.each(dicionarios[entity], function (k, f) {
        if (!isEmpty(f.rules)) {
            $.each(f.rules, function (j, r) {
                $.each(dicionarios[entity], function (i, e) {
                    if (e.id == r.campo && column == e.column) {
                        if (typeof value !== "undefined" && value !== null && (value.constructor === Array ? value.length && value.indexOf(r.valor.toString()) > -1 : r.valor.toString().toLowerCase().trim() == value.toString().toLowerCase().trim())) {
                            applyRules(entity, r, f.column)
                        } else {
                            applyRules(entity, f, f.column)
                        }
                    }
                })
            })
        }
    })
}

function applyRules(entity, rule, column) {
    let $input = $("[data-column='" + column + "']");
    let $parent = $input.closest(".parent-input");
    if (typeof rule.form.display !== "undefined" && rule.form.display) {
        $parent.removeClass("hide");
        $parent.parent().removeClass("s12 s11 s10 s9 s8 s7 s6 s5 s4 s3 s2 s1 m12 m11 m10 m9 m8 m7 m6 m5 m4 m3 m2 m1 l12 l11 l10 l9 l8 l7 l6 l5 l4 l3 l2 l1").addClass("s" + (!isEmpty(rule.form.cols) ? rule.form.cols : "12") + (!isEmpty(rule.form.colm) ? " m" + rule.form.colm : "") + (!isEmpty(rule.form.coll) ? " l" + rule.form.coll : ""));
        if (!isEmpty(rule.form.class))
            $parent.addClass(rule.form.class);
        if (!isEmpty(rule.form.atributos))
            $parent.attr(rule.form.atributos)
    } else {
        $parent.addClass("hide");
        $input.val("")
    }
    if (rule.update) {
        $parent.removeClass("disabled")
    } else {
        $parent.addClass("disabled")
    }
    let $label = $parent.find(".formLabel");
    if (rule.unique) {
        let txt = $label.html().split("<");
        $label.html(txt[0].trim() + " <sup class='color-text-red'><b>*</b></sup>")
    } else {
        let txt = $label.html().split("<");
        $label.html(txt[0].trim())
    }
    if (isEmpty($input.val()) && rule.default !== !1 && !isEmpty(rule.default))
        $input.val(rule.default)
}

function createMock(resource, nome, name, extensao, type, size, isImage) {
    if(typeof isImage === "undefined") {
        let reg = new RegExp("^image", "i");
        isImage = reg.test(type)
    }
    let dateNow = new Date();
    let icon = (!isImage && ["doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "search", "txt", "json", "js", "iso", "css", "html", "xml", "mp3", "csv", "psd", "mp4", "svg", "avi"].indexOf(extensao) > -1 ? extensao : "file");
    return {
        nome: nome,
        name: name,
        type: extensao,
        fileType: type,
        size: size,
        isImage: isImage,
        icon: icon,
        sizeName: (size > 999999 ? parseFloat(size / 1000000).toFixed(1) + "MB" : (size > 999 ? parseInt(size / 1000) + "KB" : size)),
        url: resource,
        data: zeroEsquerda(dateNow.getHours()) + ":" + zeroEsquerda(dateNow.getMinutes()) + ", " + zeroEsquerda(dateNow.getDay()) + "/" + zeroEsquerda(dateNow.getMonth()) + "/" + dateNow.getFullYear()
    }
}

function sendFileUpload(file, mock, $input, entity, column, data, loading, now, max) {
    sendFileToServerToCache(file, mock, data, entity, column, $input);
    createSource(mock, $input, (dicionarios[entity][column].format === "source_list" ? 1 : 2)).then(d => {
        Promise.all([loading]).then(f => {
            $.ajax({
                type: "POST", url: HOME + 'set', data: {lib: 'entity', file: 'ping'}, success: function (data) {
                    if (data.response === 1)
                        $(".progress-wrp[rel='" + mock.name + "']").removeClass("hide")
                }, dataType: "json"
            });
            $input.siblings(".file_gallery").find("#mock-Carregando").remove();
            if ((now + 1) < max)
                $input.siblings(".file_gallery").find(".file-more").removeClass("hide")
        })
    })
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, {type: mime})
}

function sendFileToServerToCache(file, mock, storeColumn, entity, column, $input) {
    $.ajax({
        type: "POST", url: HOME + 'set', data: {lib: 'entity', file: 'ping'}, success: function (data) {
            if (data.response === 1) {
                let upload = new Upload(file);
                upload.exeUpload(mock, $input, function (data) {
                    if (data.url !== "") {
                        mock.url = data.url;
                        mock.image = data.image;
                    }
                })
            }
        }, dataType: "json"
    })
}

var Upload = function (file) {
    this.file = file
};
var checkUploadStoped = {};
var ajaxUploadProgress = {};
Upload.prototype.exeUpload = function (mock, $input, funcao) {
    var that = this;
    var formData = new FormData();
    formData.append("lib", "entity");
    formData.append("file", "up/source");
    formData.append("name", mock.name);
    formData.append("fileType", mock.fileType);
    formData.append("type", mock.type);
    formData.append("upload", this.file, this.file.name);
    let atualPercent = 0;
    let lastPercent = 1;
    checkUploadStoped[mock.name] = setInterval(function () {
        if (atualPercent === lastPercent) {
            clearInterval(checkUploadStoped[mock.name]);
            if (typeof ajaxUploadProgress[mock.name] !== "undefined") {
                ajaxUploadProgress[mock.name].abort();
                delete (ajaxUploadProgress[mock.name])
            }
            delete (checkUploadStoped[mock.name]);
            $(".progress-wrp[rel='" + mock.name + "'] .progress-bar").css("background-color", "#d3d3d3");
            $(".progress-wrp[rel='" + mock.name + "'] .status").css("left", "41%").html("<span style='color:#e02d36'>FALHA</span>");
            removeFileForm($(".remove-file-gallery[rel='" + mock.name + "']"), 2000);
            toast("Envio de arquivo cancelado. Demorou muito a responder!", 7000, "toast-error")
        } else {
            atualPercent = lastPercent
        }
    }, 25000);
    ajaxUploadProgress[mock.name] = $.ajax({
        type: "POST", enctype: 'multipart/form-data', url: HOME + "set/", xhr: function () {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', function (event) {
                    let percent = 0;
                    let position = event.loaded || event.position;
                    let total = event.total;
                    let progress_bar_id = ".progress-wrp[rel='" + mock.name + "']";
                    if (event.lengthComputable)
                        percent = Math.ceil(position / total * 100);
                    lastPercent = percent;
                    $(progress_bar_id + " .progress-bar").css("width", +percent + "%");
                    $(progress_bar_id + " .status").text(percent + "%")
                }, !1)
            }
            return myXhr
        }, success: function (data) {
            clearInterval(checkUploadStoped[mock.name]);
            if (data.response === 1) {
                funcao(data.data);
                delete (ajaxUploadProgress[mock.name]);
                delete (checkUploadStoped[mock.name]);
                $(".progress-wrp[rel='" + mock.name + "'] .status").css("left", "46%").html("<span style='color:#fff'>OK</span>");
                setTimeout(function () {
                    $(".progress-wrp[rel='" + mock.name + "']").addClass("hide")
                }, 1000)
            } else {
                clearInterval(checkUploadStoped[mock.name]);
                delete (ajaxUploadProgress[mock.name]);
                delete (checkUploadStoped[mock.name]);
                $(".progress-wrp[rel='" + mock.name + "'] .progress-bar").css("background-color", "#d3d3d3");
                $(".progress-wrp[rel='" + mock.name + "'] .status").css("left", "41%").html("<span style='color:#e02d36'>FALHA</span>");
                removeFileForm($(".remove-file-gallery[rel='" + mock.name + "']"), 2000);
                toast("FALHA AO ENVIAR", 6000, "toast-warning");
                $input.siblings(".file_gallery").find(".file-more").removeClass("hide")
            }
        }, error: function (error) {
            clearInterval(checkUploadStoped[mock.name]);
            delete (ajaxUploadProgress[mock.name]);
            delete (checkUploadStoped[mock.name]);
            $(".progress-wrp[rel='" + mock.name + "'] .progress-bar").css("background-color", "#d3d3d3");
            $(".progress-wrp[rel='" + mock.name + "'] .status").css("left", "41%").html("<span style='color:#e02d36'>FALHA</span>");
            removeFileForm($(".remove-file-gallery[rel='" + mock.name + "']"), 2000);
            toast("FALHA AO ENVIAR", 6000, "toast-warning");
            $input.siblings(".file_gallery").find(".file-more").removeClass("hide")
        }, async: !0, data: formData, cache: !1, contentType: !1, processData: !1, timeout: 900000, dataType: "json"
    })
};

function compressImage(file, MAX_WIDTH, MAX_HEIGHT, format, response) {
    var img = document.createElement("img");
    var reader = new FileReader();
    reader.onload = function (e) {
        if (e.target.error != null) {
            console.error("File could not be read! Code " + e.target.error.code);
            response("")
        } else {
            img.src = e.target.result;
            img.onload = function () {
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH
                    }
                } else if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT
                }
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                response(canvas.toDataURL("image/" + format))
            }
        }
    };
    reader.readAsDataURL(file)
}

function createSource(mock, $input, tipo, prepend) {
    if (!isEmpty(mock)) {
        let tpl = (tipo === 1 ? 'file_list_source' : 'file_source');
        return dbLocal.exeRead('__template', 1).then(templates => {
            if (typeof prepend !== "undefined")
                $input.siblings(".file_gallery").prepend(Mustache.render(templates[tpl], mock)); else $input.siblings(".file_gallery").append(Mustache.render(templates[tpl], mock))
        })
    }
}

function searchList($input) {
    let search = $input.val();
    let column = $input.data("column");
    if ($input.is(":focus")) {
        let entity = $input.data("entity");
        let parent = $input.data("parent").replace(form.entity + ".", "").replace(form.entity, "");
        let templates = dbLocal.exeRead("__template", 1);
        let dataRead = exeRead(entity, {}, 'id', !1, 10);
        Promise.all([templates, dataRead]).then(r => {
            let results = [];
            templates = r[0];
            dataRead = r[1].data;
            $.each(dataRead, function (i, datum) {
                $.each(datum, function (col, val) {
                    if ((typeof dicionarios[entity][col] !== "undefined" && dicionarios[entity][col].format !== "password" && dicionarios[entity][col].key !== "information")) {
                        if (results.length > 14) {
                            return !1
                        } else if (val === "" || (typeof val === "string" && val.toLowerCase() === search.toLocaleString()) || (typeof val === "string" && (val.indexOf(search) > -1 || val.toLowerCase().indexOf(search) > -1))) {
                            results.push({
                                id: datum.id,
                                text: "<span class='color-gray padding-tiny padding-left padding-right s-hide'>" + col + "</span><span class='padding-left'>" + val + "</span>"
                            })
                            return !1
                        }
                    }
                });
                if (results.length > 14)
                    return !1
            });
            $input.siblings("#list-result-" + column).off("mousedown", ".list-option").on("mousedown", ".list-option", function () {
                addListSetTitle(form, entity, column, parent, $(this).attr("rel"), $input.parent())
            }).html(Mustache.render(templates.list_result, {data: results}))
        });
        $input.off("blur").on("blur", function () {
            $input.val("");
            $input.siblings("#list-result-" + column).html("")
        }).off("keydown").on("keydown", function (e) {
            if (e.which === 13 && $input.siblings("#list-result-" + column).find(".list-option").length)
                addListSetTitle(form, entity, column, parent, $input.siblings("#list-result-" + column).find(".list-option").first().attr("rel"), $input.parent())
        })
    } else {
        $input.siblings("#list-result-" + column).html("")
    }
}

/**
 * Limpa uploads em andamento
 * */
function clearUploadProgress() {
	$.each(ajaxUploadProgress, function (name, ajax) {
		clearInterval(checkUploadStoped[name]);
		ajax.abort();
		delete (ajaxUploadProgress[name]);
		delete (checkUploadStoped[name]);
		removeFileForm($(".remove-file-gallery[rel='" + name + "']"))
	});
}

/**
 * Salva formulários internos
 * */
function saveInternalForm() {
	return Promise.all([]);
	let saveInterno = [];
	$.each(form.$element.find(".form-crud"), function (e) {
		if(typeof form === "object")
			saveInterno.push(form.save(0, 1))
	});

	return Promise.all(saveInterno);
}

/**
 * Altera a interface do formulário para mostrar que o mesmo esta salvando
 * */
function setFormSaveStatus(form, status) {
    form.saving = typeof status === "undefined";
    if (form.saving) {
		form.$element.find(".loadindTableSpace").find(".btn-form-list").addClass("disabled").prop("disabled", "disabled");
		form.$element.find(".parent-save-form-mini").find("button").html("<img src='" + HOME + "assetsPublic/img/loading." + webp("gif") + "?v=" + VERSION + "' height='22' style='height: 22px;margin: 1px;' class='right'>");
		form.$element.find(".parent-save-form").find("button").html("<img src='" + HOME + "assetsPublic/img/loading." + webp("gif") + "?v=" + VERSION + "' height='20' style='height: 20px;margin-bottom: -3px;margin-right: 12px;'>Salvando");
	} else {
		form.$element.find(".loadindTableSpace").find(".btn-form-list").removeClass("disabled").prop("disabled", "");
		form.$element.find(".parent-save-form-mini").find("button").html("<i class='material-icons left'>save</i>")
		form.$element.find(".parent-save-form").find("button").html(form.options.buttonText);
	}
}

function callback() {
	if (typeof form.funcao === "function")
		return form.funcao(dados);

	return 0;
}

function saveForm(id) {
    form.save()
}

function privateFormSetError(form, error, showMessages, destroy) {
    if (showMessages) {
        navigator.vibrate(100);
        toast("Corrija o formulário", 1500, "toast-warning");
        showErrorField(form.$element, error, dicionarios[form.entity], form.entity, 1);
        setFormSaveStatus(form, 1)
    }
    if (typeof destroy !== "undefined") {
        form = Object.assign({}, form);
        form.destroy()
    }
}

function formCrud(entity, $this, parent, parentColumn, store, id) {
    checkformSaved = !1;
    return {
        identificador: id || Math.floor((Math.random() * 1000)) + "" + Date.now(),
        entity: entity,
        id: "",
        data: {},
        dataOld: {},
        error: {},
        inputs: [],
        funcao: "",
        parent: typeof parent === "string" && typeof parentColumn === "string" ? parent : "",
        parentColumn: typeof parentColumn === "string" ? parentColumn : "",
        store: typeof store === "undefined" || ["false", "0", 0, false].indexOf(store) === -1 ? 1 : 0,
        reloadAfterSave: !0,
        header: !0,
        modified: !1,
        saved: !0,
        saving: !1,
		loading: !0,
        $element: $this || "",
        options: {
            saveButton: !0,
            autoSave: !1,
            buttonText: "<i class='material-icons left padding-right'>save</i>Salvar"
        },
        goodName: function () {
            return function (text, render) {
                return ucFirst(replaceAll(replaceAll(render(text), "_", " "), "-", " "));
            }
        },
        getShow: function () {
            this.loading = !0
            let action = !isEmpty(this.id) && !isNaN(this.id) && this.id > 0 ? "update" : "create";
            return permissionToAction(this.entity, action).then(have => {
                if (have) {
                    return dbLocal.exeRead('__template', 1).then(templates => {
                        return Mustache.render(templates.form, this)
                    })
                } else {
                    return "<h2 class='form-control col align-center padding-32 color-text-gray-dark'>Sem Permissão para " + (action === "update" ? "Atualizar" : "Adicionar") + "</h2>"
                }
            })
        },
        setData: function (dados) {
            let $this = this;
            $.each(dados, function (col, value) {
                if (col === "id") {
                    $this.id = (typeof value !== "undefined" && value !== null && !isNaN(value) && value > 0 ? parseInt(value) : "");
                    $this.data.id = parseInt($this.id);
                } else if(typeof dicionarios !== "undefined") {
                    if(typeof dicionarios[$this.entity] === "undefined")
                        toast("Você não tem acesso a '" + $this.entity + "'!", 5000, "toast-warning");
                    else if (typeof dicionarios[$this.entity][col] === "object")
                        $this.data[col] = getDefaultValue(dicionarios[$this.entity][col], value)
                } else {
                    toast("Dicionário não foi carregado...", 2000, "toast-warning");
                }
            });
            $this.dataOld = $this.data
        },
        setFuncao: function (funcao) {
            this.funcao = funcao
        },
        setReloadAfterSave: function (reload) {
            this.reloadAfterSave = reload == 1 || reload === !0 || reload === "true"
        },
        setStore: function (store) {
            this.store = store == 1 || store === !0 || store === "true"
        },
        setButtonActive: function (save) {
            this.options.saveButton = save == 1 || save === !0 || save === "true"
        },
        setButtonText: function (text) {
            this.options.buttonText = text
        },
        show: function (id, fields) {
            let $this = this;
            if (typeof fields === "object")
                $this.fields = fields;
            if (typeof id !== "undefined" && !isNaN(id) && id > 0) {
                $this.id = parseInt(id);
                var loadData = loadEntityData(this.entity, id)
            } else if (isEmpty($this.data)) {
                $this.id = "";
                var loadData = new Promise((s, f) => {
                    return s(getDefaultValues(this.entity))
                })
            } else {
                var loadData = new Promise((s, f) => {
                    return s($this.data)
                })
            }
            return loadData.then(data => {
                if (!isEmpty(data)) {
                    $this.data = data;
                    $this.dataOld = Object.assign({}, data)
                }
                return getInputsTemplates($this, $this.entity).then(inputs => {
                    $this.inputs = inputs;
                    $this.getShow().then(show => {
                        if (this.$element !== "") {
                            this.$element.find(".form-control").remove();
                            this.$element.prepend(show);
                            loadMask(this);
                            this.loading = !1;
                        }
                    })
                })
            })
        },
        save: function (showMessages, destroy) {
            showMessages = typeof showMessages === "undefined" || ["false", "0", 0, false].indexOf(showMessages) === -1;
            let form = this;
			
			if(form.saving)
				return Promise.all([]);
			
            setFormSaveStatus(form);

            return validateForm(form.identificador).then(validado => {
                if (validado) {
                    if (isEmpty(ajaxUploadProgress) || confirm("Você tem arquivos sendo enviados, deseja cancelar o envio e continuar a salvar?")) {
                        clearUploadProgress();

                        return saveInternalForm().then(() => {

                            /**
                             * Obtém dados do formulário
                             * */
                            let dados = Object.assign({}, form.data);
                            if (typeof form.id !== "undefined" && !isNaN(form.id) && form.id > 0)
                                dados.id = form.id;

                            form.saved = !0;
                            if (form.store) {
                                return db.exeCreate(form.entity, dados).then(syncData => {
                                    let error = syncData.db_errorback;
                                    delete syncData.db_errorback;
									
                                    let pp = [];
                                    pp.push(callback());
									
                                    let id = parseInt(dados.id);
                                    if (error === 0) {
                                        if (form.id === "" || (typeof syncData.id_old !== "undefined" && parseInt(form.id) === parseInt(syncData.id_old))) {
                                            syncData.id = parseInt(syncData.id);
                                            id = syncData.id;
                                            if (form.id === "" && typeof syncData.id_old !== "undefined" && !isNaN(syncData.id_old) && parseInt(syncData.id_old) !== parseInt(syncData.id))
                                                dbLocal.exeDelete(form.entity, syncData.id_old);
                                            delete (syncData.id_old);
                                            delete (syncData.db_action);
                                            form.setData(syncData);
                                        }

                                        form.id = id;
                                        return Promise.all(pp).then(() => {
                                            return (form.reloadAfterSave ? form.show(id) : !0)
                                        })
                                    } else {
                                        privateFormSetError(form, syncData, showMessages, destroy);
                                    }
                                }).then(() => {
                                    if(typeof history.state.param.column !== "undefined")
                                        history.back();
                                })

                            } else {

                                if (typeof form.id === "undefined" || isNaN(form.id) || form.id < 1)
                                    form.id = form.data.id = Date.now();

                                getRelevantTitle(form.entity, form.data).then(title => {
                                    form.data.columnTituloExtend = title;
                                    form.data.columnName = history.state.param.column;
                                    form.data.columnRelation = form.entity;
                                    form.data.columnStatus = {column: '', have: !1, value: !1};
                                }).then(() => {

                                    callback();
                                    history.back();
                                });
                            }

                        }).then(() => {
							setFormSaveStatus(form, 1);
							
                            if (showMessages)
                                toast("Salvo", 2000, 'toast-success')
                        })
                    } else  {
                        setFormSaveStatus(form, 1);
                    }
                } else {
                    privateFormSetError(form, form.error, showMessages, destroy);
                    return 1
                }
            }).catch(e => {
            })
        },
        destroy: function () {
            this.$element.html("");
            delete (form)
        }
    };
}

function getInputsTemplates(form, parent, col) {
    return dbLocal.exeRead('__template', 1).then(templates => {
        let inputs = [];
        let promessas = [];
        let position = 0;
        $.each(dicionarios[form.entity], function (column, meta) {
            if ((isEmpty(form.fields) && isEmpty(col)) || (!isEmpty(form.fields) && form.fields.indexOf(column) > -1) || (!isEmpty(col) && col === column)) {
                let metaInput = Object.assign({}, meta);
                metaInput.parent = parent;
                metaInput.value = form.data[column] || "";
                metaInput.isNumeric = ["float", "decimal", "smallint", "int", "tinyint"].indexOf(metaInput.type) > -1;
                metaInput.valueLenght = (metaInput.isNumeric && !isNaN(metaInput.minimo) ? metaInput.minimo : metaInput.value.length);
                metaInput.isFull = metaInput.valueLenght === metaInput.size;
                metaInput.disabled = !isNaN(form.id) && form.id > 0 && !metaInput.update;
                if (!isEmpty(metaInput.default) && metaInput.default.length > 7)
                    metaInput.default = Mustache.render(metaInput.default, {
                        vendor: VENDOR,
                        home: HOME,
                        version: VERSION
                    });
                metaInput = getExtraMeta(form.identificador, form.entity, metaInput);
                if (metaInput.format === "password") {
                    metaInput.value = "";
                    metaInput.nome = "Nova Senha"
                }
                if (typeof metaInput.form !== "object")
                    metaInput.form = {};
                metaInput.form.class = (!isEmpty(metaInput.form.class) ? metaInput.form.class : "") + (typeof meta.form.display !== "undefined" && !meta.form.display ? " hide" : "");
                if (metaInput.format === "extend") {
                    let p = position;
                    promessas.push(getInputsTemplates({
                        entity: metaInput.relation,
                        dicionario: dicionarios[metaInput.relation],
                        identificador: form.identificador,
                        data: metaInput.value
                    }, parent + "." + column).then(inp => {
                        metaInput.inputs = inp;
                        inputs.splice(p, 0, Mustache.render(templates[metaInput.form.input], metaInput))
                    }))
                } else if (typeof templates[metaInput.form.input] === "string") {
                    let file_source = "";
                    switch (metaInput.format) {
                        case 'source_list':
                            file_source = "file_list_source";
                            break;
                        case 'source':
                            file_source = "file_source";
                            break;
                        case 'extend_mult':
                            file_source = "extend_register";
                            break;
                        case 'extend_folder':
                            file_source = "extend_register_folder";
                            break
                    }

                    if(!isEmpty(metaInput.value) && typeof metaInput.value === "object" && metaInput.value.constructor === Array && (metaInput.format === 'source_list' || metaInput.format === "file_list_source")) {
                        $.each(metaInput.value, function (i, e) {
                            metaInput.value[i].isImage = e.isImage === "true" || e.isImage === 1 || e.isImage === true;
                        })
                    }
					
                    inputs.splice(position, 0, Mustache.render(templates[metaInput.form.input], metaInput, {file_source: templates[file_source]}))
                }
                position++
            }
        });
        return Promise.all(promessas).then(d => {
            return inputs
        })
    })
}

function loadEntityData(entity, id) {
    let dados = {};
    return db.exeRead(entity, parseInt(id)).then(data => {
        let dicionario = dicionarios[entity];
        if (!isEmpty(data)) {
            $.each(data, function (col, value) {
                if (typeof dicionario[col] === 'object' && dicionario[col] !== null) {
                    let meta = dicionario[col];
                    if (typeof meta !== "undefined" && meta.format !== "information" && meta.key !== "identifier") {
                        dados[col] = getDefaultValue(meta, value)
                    }
                }
            })
        }
        return dados
    })
}

function getExtraMeta(identificador, entity, meta) {
    meta.formIdentificador = identificador;
    meta.entity = entity;
    meta.home = HOME;
    meta.valueJson = typeof meta.value === "object" && meta.value !== null ? JSON.stringify(meta.value) : (isJson(meta.value) ? meta.value : null);
    meta.multiples = meta.size && meta.size > 1;
    meta.allow.empty = typeof meta.allow.options === "object" && $.isEmptyObject(meta.allow.options);
    meta.required = meta.default === !1;
    if (meta.group === "select") {
        $.each(meta.allow.options, function (i, e) {
            e.formIdentificador = identificador;
            if (meta.format === "checkbox")
                meta.allow.options[i].isChecked = (meta.value && (meta.value == e.valor || ($.isArray(meta.value) && (meta.value.indexOf(parseInt(e.valor)) > -1 || meta.value.indexOf(e.valor.toString()) > -1)) || (isJson(meta.value) && $.isArray(JSON.parse(meta.value)) && (JSON.parse(meta.value).indexOf(parseInt(e.valor)) > -1 || JSON.parse(meta.value).indexOf(e.valor.toString()) > -1)))); else meta.allow.options[i].isChecked = (meta.value && meta.value == e.valor)
        })
    } else if (meta.format === "extend_folder" || meta.format === "extend_mult" && !isEmpty(meta.value) && meta.value.constructor === Array && meta.value.length) {
        $.each(meta.value, function (i, e) {
            if (typeof e.columnStatus === "undefined") {
                e.columnStatus = {column: '', have: !1, value: !1}
            } else {
                e.formIdentificador = identificador;
                e.columnStatus.have = e.columnStatus.have === "true" || e.columnStatus.have === "1";
                e.columnStatus.value = e.columnStatus.value === "true" || e.columnStatus.value === "1"
            }
        })
    }
    return meta
}

function loadMask(form) {
    let $form = form.$element;
    let SPMaskBehavior = function (val) {
        return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009'
    }, spOptions = {
        onKeyPress: function (val, e, field, options) {
            field.mask(SPMaskBehavior.apply({}, arguments), options)
        }
    };

    if($form.find("input[type='tel']").length)
        $form.find("input[type='tel']").mask(SPMaskBehavior, spOptions);

    if($form.find(".ie").length)
        $form.find(".ie").find("input").mask('999.999.999.999', {reverse: !0});

    if($form.find(".cpf").length)
        $form.find(".cpf").find("input").mask('999.999.999-99', {reverse: !0});

    if($form.find(".cnpj").length)
        $form.find(".cnpj").find("input").mask('99.999.999/9999-99', {reverse: !0});

    if($form.find(".cep").length)
        $form.find(".cep").find("input").mask('99999-999', {reverse: !0});

    if($form.find(".percent").length)
        $form.find('.percent').find("input").mask('##0,00%', {reverse: !0});

    if($form.find(".valor").length)
        $form.find(".valor").find("input").mask('#.##0,00', {reverse: !0});

    if ($form.find(".valor_decimal").length)
        $form.find(".valor_decimal").find("input").mask('#.##0,000', {reverse: !0});

    if ($form.find(".valor_decimal_plus").length)
        $form.find(".valor_decimal_plus").find("input").mask('#.##0,0000', {reverse: !0});

    if ($form.find(".valor_decimal_minus").length)
        $form.find(".valor_decimal_minus").find("input").mask('#.##0,0', {reverse: !0});

    if ($form.find(".valor_decimal_none").length)
        $form.find(".valor_decimal_none").find("input").mask('#.##0', {reverse: !0});

    if($form.find(".date_time").length)
        $form.find('.date_time').find("input").mask('00/00/0000 00:00:00');

    if($form.find(".card_number").length)
        $form.find('.card_number').find("input").mask('0000 0000 0000 0000 0000', {reverse: !0});

    if($form.find("input[data-format='float']").length)
        $form.find("input[data-format='float']").mask("#0.00", {reverse: !0});

    $form.find("input[data-format='float'], input[data-format='number']").off("keypress").on("keypress", function (evt) {
        if (evt.which != 8 && evt.which != 0 && evt.which < 48 || evt.which > 57)
            evt.preventDefault()
    });

    $form.find("input").on("click focus", function () {
        $(this).removeAttr("readonly")
    });
    $.each($form.find(".list"), function () {
        let v = $(this).data("value");
        let parent = $(this).attr('data-parent').replace(form.entity + ".", "").replace(form.entity, "");
        if (v !== "" && !isNaN(v))
            addListSetTitle(form, $(this).data("entity"), $(this).data("column"), parent, $(this).attr('data-value'), $(this).parent())
    });
    checkUserOptions();
    clearMarginFormInput();
    loadFolderDrag();
    $form.find("input[type='text'].formCrudInput, input[type='tel'].formCrudInput, input[type='number'].formCrudInput").trigger("change")
}

function loadFolderDrag() {
    $(".extend_list_register").sortable({
        revert: !1, stop: function () {
            let $div = $(this).closest(".extend_list_register");
            let column = $div.data("column");
            let order = [];
            $div.children(".extend_register").each(function () {
                let id = parseInt($(this).attr('rel'));
                for (let i in form.data[column]) {
                    if (typeof form.data[column][i] === "object" && parseInt(form.data[column][i].id) === id) {
                        order.push(form.data[column][i]);
                        break
                    }
                }
            });
            form.data[column] = order
        }
    })
}

function addListRegister(entity, form, column, parent, data, el) {
    if (!isEmpty(form.data[column]) && !isNaN(form.data[column])) {
        return db.exeCreate(entity, data).then(() => {
            return addListSetTitle(form, entity, column, parent, data.id, $(el).siblings('.list-input'))
        })
    } else {
        return db.exeCreate(entity, data).then(dados => {
            form.data[column] = dados[0].id;
            form.setReloadAfterSave(!1);
            addListSetTitle(form, entity, column, parent, data.id, $(el).siblings('.list-input'));
            return 1
        })
    }
}

function addListSetTitle(form, entity, column, parent, id, $input) {
    let formData = (parent !== "" ? fetchFromObject(form.data, parent) : form.data);
    formData[column] = id;
    db.exeRead(entity, parseInt(id)).then(data => {
        let point = ".";
        $input.find("input[type='text']").prop("disabled", !0).val("carregando valor");
        let intt = setInterval(function () {
            $input.find("input[type='text']").val("carregando valor " + point);
            point = (point === "." ? ".." : (point === ".." ? "..." : "."))
        }, 300);
        getRelevantTitle(entity, data).then(title => {
            clearInterval(intt);
            $input.siblings(".btn").find(".list-btn-icon").html("edit");
            $input.siblings(".btn").find("div").html("editar");
            $input.prop("disabled", !1).addClass("border-bottom").removeClass("padding-small").css({
                "padding": "10px 2px 4px",
                "margin-bottom": "20px"
            }).html(title);
            $input.siblings(".list-remove-btn").remove();
            if (isNaN(form.id) || dicionarios[form.entity][column].update)
                $("<div class='right pointer list-remove-btn color-text-gray-dark color-hover-text-red' style='padding: 7px 10px' onclick=\"deleteRegisterAssociation('" + column + "', this)\"><i class='material-icons'>close</i></div>").insertBefore($input)
        })
    })
}

function addRegisterAssociation(entity, column) {
	let identificadorExtend = Math.floor((Math.random() * 1000)) + "" + Date.now();
	history.state.param.data = Object.assign({id: form.id}, form.data);
	history.replaceState(history.state, null, HOME + app.route);
    history.state.param.openForm = {entity: entity, column: column, identificador: identificadorExtend, tipo: 1};
	if (!isEmpty(form.data[column]) && !isNaN(form.data[column])) {
		db.exeRead(entity, parseInt(form.data[column])).then(data => {
			if (data)
				pageTransition(entity, "form", "forward", "#dashboard", {
					data: data,
					parent: entity,
					column: column,
					store: !0,
					identificador: identificadorExtend
				}); else toast("Registro não encontrado", 2500, "toast-warning")
		})
	} else {
		pageTransition(entity, "form", "forward", "#dashboard", {
			parent: entity,
			column: column,
			store: !0,
			identificador: identificadorExtend
		})
	}
}

function deleteRegisterRelation(column) {
    if(confirm("Remover Registro Vinculado?")) {
        let $btn = $(".deleteRegisterRelation[rel='" + column + "']").siblings(".btn");
        $btn.find("i.material-icons").html("add");
        $btn.find("div").html("adicionar");
        form.data[column] = null;
        $(".deleteRegisterRelation[rel='" + column + "'], .registerRelationName[rel='" + column + "']").remove();
    }
}

function deleteRegisterAssociation(col, el) {
    if(confirm("Remover Associação com este registro?")) {
		form.data[col] = "";
		form.modified = !0;
        form.saved = !1;
		getInputsTemplates(form, form.entity, col).then(inputTemplate => {
			$(el).closest(".parent-input").parent().replaceWith(inputTemplate[0])
		})
    }
}

/**
 * Mult relation extend add
 * */
function addRegisterRelation(entity, column) {
    if(dicionarios[form.entity][column].size === !1 || typeof form.data[column] === "string" || form.data[column] === null || dicionarios[form.entity][column].size > form.data[column].length) {
        let identificadorExtend = Math.floor((Math.random() * 1000)) + "" + Date.now();
        history.state.param.openForm = {entity: entity, column: column, identificador: identificadorExtend, tipo: 2};
        history.state.param.data = Object.assign({id: form.id}, form.data);
        history.state.param.modified = form.modified;
        history.replaceState(history.state, null, HOME + app.route);
        pageTransition(entity, "form", "forward", "#dashboard", {parent: entity, column: column, store: !1, identificador: identificadorExtend});
    } else {
        toast("máximo de registros atingido", 2500, "toast-warning");
    }
}

/**
 * Single relation extend edit
 * */
function editRegisterRelation(entity, column, id) {
    let identificadorExtend = Math.floor((Math.random() * 1000)) + "" + Date.now();
    history.state.param.openForm = {entity: entity, column: column, identificador: identificadorExtend, tipo: 2};
    history.state.param.data = Object.assign({id: form.id}, form.data);
    history.state.param.modified = form.modified;
    history.replaceState(history.state, null, HOME + app.route);
    let data = {};
    $.each(form.data[column], function (i, e) {
        if(e.id == id) {
            data = e;
            return !1;
        }
    })
    pageTransition(entity, "form", "forward", "#dashboard", {data: data, parent: entity, column: column, store: !1, identificador: identificadorExtend});
}

/**
 * Single relation extend
 * */
function editFormRelation(entity, column) {
    let identificadorExtend = Math.floor((Math.random() * 1000)) + "" + Date.now();
    history.state.param.openForm = {entity: entity, column: column, identificador: identificadorExtend, tipo: 2};
    history.state.param.modified = form.modified;
    history.state.param.data = Object.assign({id: form.id}, form.data);
    history.replaceState(history.state, null, HOME + app.route);

    if(typeof form.data[column] === "object" && form.data[column] !== null && form.data[column].constructor === Array && form.data[column].length && typeof form.data[column][0] === "object")
        pageTransition(entity, "form", "forward", "#dashboard", {data: form.data[column][0], parent: entity, column: column, store: !1, identificador: identificadorExtend});
    else
        pageTransition(entity, "form", "forward", "#dashboard", {parent: entity, column: column, store: !1, identificador: identificadorExtend});
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
                            pp.push(dbLocal.exeRead(e.relation, parseInt(data[e.column])).then(d => {
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

function deleteExtendMult(column, id) {
    if (confirm("Remover Registro?")) {
        let entityReal = form.entity;
        let columnReal = column;
        if (typeof dicionarios[entityReal][column] === "undefined") {
            $.each(dicionarios[entityReal], function (i, meta) {
                if (meta.format === "extend" && typeof dicionarios[meta.relation][column] !== "undefined") {
                    entityReal = meta.relation;
                    columnReal = meta.column;
                    return !1
                }
            })
        }
        if (columnReal !== column) {
            $.each(form.data[columnReal][column], function (i, val) {
                if (typeof val === "object" && !isNaN(val.id) && parseInt(val.id) === parseInt(id)) {
                    form.data[columnReal][column].splice(i, 1);
                    return !1
                }
            })
        } else {
            $.each(form.data[column], function (i, val) {
                if (typeof val === "object" && !isNaN(val.id) && parseInt(val.id) === parseInt(id)) {
                    form.data[column].splice(i, 1);
                    return !1
                }
            })
        }
        let $reg = form.$element.find(".extend_register[rel='" + id + "']");
        let $regList = $reg.closest(".extend_list_register");
        $regList.css("height", $regList.css("height")).css("height", (parseInt($regList.css("height")) - parseInt($reg.css("height"))) + "px");
        $reg.css("height", $reg.css("height")).css("height", 0).removeClass("padding-small");
        setTimeout(function () {
            $reg.remove()
        }, 400)
    }
};