var grids = [];

function gridTr(identificador, entity, data, fields, info, autores, actions, selecteds) {
    let gridContent = {
        id: data.id || 0,
        db_status: (typeof data.db_status !== "boolean" || data.db_status),
        online: navigator.onLine,
        identificador: identificador,
        entity: entity,
        fields: [],
        permission: !0,
        button: {}
    };
    let pp = [];
    pp.push(actions['delete'] ? permissionToAction(entity, 'delete') : !1);
    pp.push(actions.update ? permissionToAction(entity, 'update') : !1);
    if (typeof info !== "undefined" && typeof info.autor !== "undefined" && !isNaN(info.autor) && info.autor === 1 && getCookie("setor") !== "admin") {
        pp.push(permissionToChange(entity, data))
    }
    return Promise.all(pp).then(r => {
        gridContent.button.delete = r[0];
        gridContent.button.update = r[1];
        gridContent.button.status = {have: !1, status: !1};
        gridContent.button.autor = {have: !1, id: !1, list: []};
        if (typeof r[2] !== "undefined")
            gridContent.permission = d === 0;
        return r
    }).then(d => {
        if (actions.status && gridContent.button.update && typeof info.status !== "undefined" && !isNaN(info.status) && info.status > 0) {
            gridContent.button.status.have = !0;
            $.each(dicionarios[entity], function (col, dic) {
                if (dic.id === info.status) {
                    if (dic.update && dic.datagrid !== !1)
                        gridContent.button.status.status = (data[col] === "true" || data[col] === !0 || data[col] === 1 || data[col] === "1"); else gridContent.button.status.have = !1;
                    return !1
                }
            })
        }
        if (actions.autor && getCookie("setor") === "admin" && typeof info.autor !== "undefined" && !isNaN(info.autor) && info.autor > 0) {
            gridContent.button.autor.have = !0;
            let colAutor = info.autor === 2 ? "ownerpub" : "autorpub";
            if (isEmpty(data[colAutor]))
                gridContent.button.autor.id = !0;
            $.each(autores, function (i, e) {
                gridContent.button.autor.list.push({id: e.id, nome: e.nome, selected: e.id == data[colAutor]})
            })
        }
        let wait = [];
        $.each(fields, function (i, e) {
            if (typeof data[e.column] !== "undefined") {
                let tr = {
                    id: data.id,
                    entity: gridContent.entity,
                    style: '',
                    class: '',
                    checked: e.first && selecteds.indexOf(parseInt(data.id)) > -1,
                    first: e.first
                };
                tr.class = getTrClass(dicionarios[entity][e.column], data[e.column]);
                tr.style = getTrStyle(dicionarios[entity][e.column], data[e.column]);
                gridContent.fields.push(tr);
                wait.push(gridTdFilterValue(data[e.column], dicionarios[entity][e.column]).then(v => {
                    tr.value = v
                }))
            }
        });
        return Promise.all(wait).then(() => {
            return gridContent
        })
    })
}

function getTrStyle(meta, value) {
    if (typeof meta !== "undefined") {
        let style = meta.datagrid.grid_style;
        if (meta.key === "source" && meta.size == 1 && value !== null && typeof value === "object" && typeof value[0] === "object" && typeof value[0].fileType === "string" && /^image\//.test(value[0].fileType)) {
            style += "background-image: url(" + value[0].image + ");"
        }
        return style
    }
    return ""
}

function getTrClass(meta, value) {
    if (typeof meta !== "undefined") {
        let classe = 'td-' + meta.format + " " + meta.datagrid.grid_class;
        if (meta.key === "source" && meta.size == 1 && value !== null && typeof value === "object" && typeof value[0] === "object" && typeof value[0].fileType === "string" && /^image\//.test(value[0].fileType)) {
            classe += " tableImgTd"
        }
        return classe
    }
    return ""
}

function gridTdFilterValue(value, meta) {
    if (typeof meta !== "undefined") {
        if (['list_mult', 'selecao_mult', 'extend_folder', 'extend_mult'].indexOf(meta.format) > -1) {
        } else if (['folder', 'extend'].indexOf(meta.format) > -1) {
            return getRelevantTitle(meta.relation, value, 1, !1)
        } else if (['list', 'selecao', 'checkbox_rel', 'checkbox_mult'].indexOf(meta.format) > -1) {
            return db.exeRead(meta.relation, parseInt(value)).then(data => {
                return getRelevantTitle(meta.relation, data, 1, !1)
            })
        } else {
            value = applyFilterToTd(value, meta)
        }
    }
    return Promise.all([]).then(() => {
        return value
    })
}

function applyFilterToTd(value, meta) {
    if (!isEmpty(meta.allow.options) && meta.key !== 'source') {
        $.each(meta.allow.options, function (i, e) {
            if (e.option == value) {
                value = e.name;
                return !1
            }
        })
    } else if (meta.format === 'date') {
        if (/-/.test(value)) {
            let v = value.split('-');
            value = v[2] + "/" + v[1] + "/" + v[0]
        }
    } else if (meta.format === 'datetime') {
        if (/T/.test(value)) {
            let b = value.split('T');
            let v = b[0].split('-');
            value = v[2] + "/" + v[1] + "/" + v[0] + " " + b[1]
        } else if (/ /.test(value)) {
            let b = value.split(' ');
            let v = b[0].split('-');
            value = v[2] + "/" + v[1] + "/" + v[0] + " " + b[1]
        }
    } else if (meta.key === 'source') {
        if (meta.key === "source" && meta.size == 1 && value !== null && typeof value === "object" && typeof value[0] === "object" && typeof value[0].fileType === "string" && /^image\//.test(value[0].fileType)) {
            value = ""
        } else {
            value = "<svg class='icon svgIcon' ><use xlink:href='#file'></use></svg>"
        }
    }
    return value
}

function getFields(entity, haveId) {
    haveId = haveId || !1;
    let relevants = dbLocal.exeRead("__relevant", 1);
    let relation = dbLocal.exeRead("__general", 1);
    let info = dbLocal.exeRead("__info", 1);
    return Promise.all([relevants, relation, info]).then(r => {
        if(isEmpty(r[0])) {
            return new Promise(r => {
                setTimeout(function () {
                    r(getFields(entity, haveId));
                }, 200);
            })
        } else {
            return getFieldsData(entity, haveId, r);
        }
    })
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
        if (!isEmpty(e.datagrid.grid_relevant)) {
            let data = {
                'nome': e.nome,
                'column': e.column,
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
    for (let a = 0; a < 5; a++) {
        if (isEmpty(fields[a])) {
            $.each(dicionarios[entity], function (i, e) {
                $.each(relevants, function (f, r) {
                    if(e.datagrid !== !1 && relevants.indexOf(e.format) > -1) {
                        let allReadyHave = !1;
                        $.each(fields, function (g, h) {
                            if (h.nome === e.nome) {
                                allReadyHave = !0;
                                return !1
                            }
                        });
                        if (!allReadyHave) {
                            let data = {
                                'nome': e.nome,
                                'column': e.column,
                                'class': e.datagrid.grid_class || "",
                                'style': e.datagrid.grid_style || "",
                                'template': e.datagrid.grid_template || "",
                                'format': e.format,
                                'relation': e.relation || null,
                                'first': !haveId && a === 0
                            };
                            let indice = getIndiceField(a, indices);
                            indices.push(indice);
							pushToArrayIndex(fields, data, indice)
                        }
                    }
                })
            })
        }
    }
    return fields.filter(function (data) {
        if (!isEmpty(data))
            return data
    })
}

function reverse(s) {
    if (typeof s === "string")
        return s.split("").reverse().join("");
    return ""
}

function separaNumeroValor(val, charact) {
    charact = charact || " ";
    val = reverse(val);
    return reverse(val.substring(0, 3) + (val.substring(3, 6) !== "" ? charact + val.substring(3, 6) : "") + (val.substring(6, 9) !== "" ? charact + val.substring(6, 9) : "") + (val.substring(9, 12) !== "" ? charact + val.substring(9, 12) : "") + (val.substring(12, 15) !== "" ? charact + val.substring(12, 15) : "") + (val.substring(15, 18) !== "" ? charact + val.substring(15, 18) : ""))
}

function clearForm() {
    $("#app").off("click", ".btn-form-list").on("click", ".btn-form-list", function () {
        form.setReloadAfterSave(!1);
        form.save(0).then(() => {
            animateBack("#dashboard").grid(form.entity)
        })
    }).off("click", ".btn-form-save").on("click", ".btn-form-save", function () {
        form.save()
    });
    checkUserOptions()
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
        }, cardnumber: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : (v === 8 ? '0000 0000' : v === 12 ? '0000 0000 0000' : v === 16 ? '0000 0000 0000 0000' : '0000 0000 0000 0000 0000')
        }, float: val => {
            let v = val.replace(/\D/g, '').length;
            return v === 0 ? '' : (v === 2 ? '00.\0\0' : (v === 1 ? '0.\0\0' : separaNumeroValor(Math.pow(10, (v - 2)).toString().substring(1)) + '.00'))
        },
    }
    $data.find(".td-tel").find(".td-value").mask(SP.tel);
    $data.find(".td-ie").find(".td-value").mask(SP.ie);
    $data.find(".td-cpf").find(".td-value").mask(SP.cpf);
    $data.find(".td-cnpj").find(".td-value").mask(SP.cnpj);
    $data.find(".td-cep").find(".td-value").mask(SP.cep);
    $data.find('.td-percent').find(".td-value").mask(SP.percent);
    $data.find(".td-valor").find(".td-value").mask(SP.valor);
    $data.find('.td-datetime').find(".td-value").mask(SP.datetime);
    $data.find('.td-card_number').find(".td-value").mask(SP.cardnumber);
    $data.find(".td-float").find(".td-value").mask(SP.float);
    return $data
}

function loadMaskTable($table) {
    maskData($table)
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

var syncGrid = null;

function gridCrud(entity, fields, actions) {
    let identificador = Math.floor((Math.random() * 1000)) + "" + Date.now();
    if (typeof actions === "object" && !isEmpty(actions)) {
        actions = {
            autor: typeof actions.autor !== "undefined" ? actions.autor : !1,
            create: typeof actions.create !== "undefined" ? actions.create : !0,
            update: typeof actions.update !== "undefined" ? actions.update : !0,
            delete: typeof actions['delete'] !== "undefined" ? actions['delete'] : !0,
            status: typeof actions.status !== "undefined" ? actions.status : !0,
        }
    }
    grids = [];
    let grid = grids[identificador] = {
        identificador: identificador,
        entity: entity,
        data: {},
        $element: "",
        $content: "",
        total: 0,
        limit: localStorage.limitGrid ? parseInt(localStorage.limitGrid) : 15,
        page: 1,
        order: 'id',
        orderPosition: !0,
        filter: [],
        historic: 0,
        filterTotal: -1,
        actions: actions || {autor: !1, create: !0, update: !0, delete: !0, status: !0},
        fields: fields || [],
        goodName: function () {
            return function (text, render) {
                return ucFirst(replaceAll(replaceAll(render(text), "_", " "), "-", " "))
            }
        },
        applyFilters: function () {
            let $this = this;
            $this.readData()
        },
        readData: function () {
            clearHeaderScrollPosition();
            let $this = this;
            $this.$content = $this.$element.find("tbody");
            let selecteds = [];
            let offset = ($this.page * $this.limit) - $this.limit;
            let info = dbLocal.exeRead("__info", 1);
            let result = exeRead(entity, $this.filter, $this.order, $this.orderPosition, $this.limit, offset);
            let users = dbLocal.exeRead("__user", 1);
            let templates = dbLocal.exeRead("__template", 1);
            let $loadingLoading = $("<div class='col' id='tr-loading' style='position: relative;height: 4px;'></div>").insertAfter($this.$element.find(".table-all"));
            $loadingLoading.loading();
            let loadingContent = setInterval(function () {
                $loadingLoading.loading()
            }, 2000);
            if ($this.$content.find(".table-select:checked").length > 0) {
                $.each($this.$content.find(".table-select:checked"), function (i, e) {
                    selecteds.push(parseInt($(this).attr("rel")))
                })
            }
            $(".table-info-result").remove();
            $this.$content.parent().find("thead").removeClass("hide");
            return Promise.all([info, result, users, templates]).then(r => {
                info = r[0];
                result = r[1];
                users = r[2];
                templates = r[3];
                dbLocal.exeRead('__historic', 1).then(hist => {
                    $this.historic = hist[$this.entity]
                });
                if (typeof info !== "undefined") {
                    let totalFormated = "";
                    let total = result.length;
                    let le = total.length;
                    for (let i = 0; i < le; i++)
                        totalFormated += (i > 0 && (le - i) % 3 === 0 ? "." : "") + total[i];
                    $this.$element.find(".total").html(totalFormated + " registro" + (totalFormated > 1 ? "s" : ""));
                    $this.filterTotal = -1;
                    let pp = [];
                    $this.$content.html("");
                    for (let k in result) {
                        if (typeof result[k] === "object" && !isEmpty(result[k])) {
                            pp.push(gridTr($this.identificador, entity, result[k], $this.fields, info[entity], users, grid.actions, selecteds).then(tr => {
                                $this.$content.append(Mustache.render(templates['grid-content'], tr))
                            }))
                        }
                    }
                    return Promise.all(pp).then(d => {
                        if (isEmpty(d)) {
                            $this.$content.parent().find("thead").addClass("hide");
                            $("<div class='color-text-gray-dark font-xlarge font-light color-white padding-48 align-center table-info-result'><p class='margin-bottom' style='margin-top: 0;'><i class='material-icons font-xxlarge color-text-gray-dark'>priority_high</i></p>sem registros</div>").insertAfter($this.$content.parent())
                        }
                        $loadingLoading.remove();
                        clearInterval(loadingContent);
                        $this.posData()
                    })
                } else {
                    $loadingLoading.remove();
                    clearInterval(loadingContent)
                }
            })
        },
        readDataConfigAltered: function (limit) {
            let grid = this;
            let offset = (grid.page * grid.limit) - grid.limit;
            offset = offset >= grid.total ? grid.total - grid.limit : offset;
            grid.limit = parseInt(limit);
            if (offset >= grid.limit) {
                grid.page = 1 + Math.floor(offset / grid.limit)
            } else {
                grid.page = 1
            }
            this.readData()
        },
        getShow: function () {
            var pT = dbLocal.keys(entity);
            var pF = (isEmpty(grid.fields) ? getFields(entity, !0) : new Promise());
            let perm = permissionToAction(this.entity, 'read');
            let sync = dbLocal.exeRead("sync_" + this.entity);
            return Promise.all([pT, perm, pF, sync]).then(r => {

                if(SERVICEWORKER) {
                    this.total = r[0].length;
                    let have = r[1];
                    let haveSync = r[3].length > 0 && navigator.onLine ? r[3].length : 0;
                    if (isEmpty(grid.fields))
                        this.fields = r[2];
                    if (have) {
                        if (!localStorage.limitGrid)
                            localStorage.limitGrid = 15;
                        limits = {
                            a: this.limit === 15,
                            b: this.limit === 25,
                            c: this.limit === 50,
                            d: this.limit === 100,
                            e: this.limit === 250,
                            f: this.limit === 500,
                            g: this.limit === 1000
                        };
                        return permissionToAction(this.entity, 'create').then(t => {
                            if (this.actions.create)
                                this.actions.create = t;
                            return dbLocal.exeRead('__template', 1).then(templates => {
                                return Mustache.render(templates.grid, {
                                    entity: entity,
                                    home: HOME,
                                    sync: haveSync,
                                    limits: limits,
                                    novo: this.actions.create,
                                    identificador: this.identificador,
                                    goodName: this.goodName,
                                    total: this.total,
                                    fields: this.fields
                                })
                            })
                        })
                    }
                    return "<h2 class='align-center padding-32 color-text-gray-dark'>Sem Permissao para Leitura</h2>"
                } else {
                    var pF = (isEmpty(grid.fields) ? getFields(entity, !0) : new Promise());
                    let perm = permissionToAction(this.entity, 'read');
                    return Promise.all([perm, pF]).then(r => {
                        if(r[0]) {
                            if (isEmpty(grid.fields))
                                this.fields = r[1];

                            if (!localStorage.limitGrid)
                                localStorage.limitGrid = 15;

                            limits = {
                                a: this.limit === 15,
                                b: this.limit === 25,
                                c: this.limit === 50,
                                d: this.limit === 100,
                                e: this.limit === 250,
                                f: this.limit === 500,
                                g: this.limit === 1000
                            };

                            return permissionToAction(this.entity, 'create').then(t => {
                                if (this.actions.create)
                                    this.actions.create = t;

                                return dbLocal.exeRead('__template', 1).then(templates => {
                                    return Mustache.render(templates.grid, {
                                        entity: entity,
                                        home: HOME,
                                        sync: !1,
                                        limits: limits,
                                        novo: this.actions.create,
                                        identificador: this.identificador,
                                        goodName: this.goodName,
                                        total: "-",
                                        fields: this.fields
                                    })
                                })
                            })
                        }
                        return "<h2 class='align-center padding-32 color-text-gray-dark'>Sem Permissao para Leitura</h2>"
                    });
                }
            })
        },
        show: function ($element) {
            if (typeof $element !== "undefined")
                this.$element = $element;
            if (typeof this.$element !== "undefined") {
                this.$element.find(".grid-control").remove();
                return this.getShow().then(data => {
                    this.$element.html(data);
                    return this.readData()
                })
            }
        },
        posData: function () {
            loadMaskTable(this.$content);
            clearForm();
            $.cachedScript(HOME + "assetsPublic/tableCore.min.js?v=" + VERSION).then(() => {
                this.$element.find(".pagination").remove();
                let total = parseInt(this.$element.find(".total").html().replace(".", "").replace(".", "").replace(".", ""));
                if (total > this.limit) {
                    let $this = this;
                    $this.$element.find(".grid-form-body").materializePagination({
                        currentPage: $this.page,
                        lastPage: Math.ceil(total / $this.limit),
                        onClickCallback: function (requestedPage) {
                            if (requestedPage !== $this.page) {
                                $this.page = requestedPage;
                                $this.readData()
                            }
                        }
                    })
                }
            });
        },
        reload: function () {
            this.readData();
        },
        destroy: function () {
            clearInterval(syncGrid);
            this.$element.html("");
            delete (grids[this.identificador])
        }
    };
    return grid
}

$(function ($) {
    $.fn.grid = function (entity, fields, actions) {
        let $this = this;
        let grid = gridCrud(entity, fields, actions);
        grid.show($this).then(() => {
            app.removeLoading($this);
        })
        return $this
    }
}, jQuery);