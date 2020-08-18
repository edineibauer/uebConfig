var grids = [];

async function gridTr(identificador, entity, data, fields, info, actions, selecteds) {
    let gridContent = {
        id: data.id || 0,
        db_status: (typeof data.db_status !== "boolean" || data.db_status),
        online: navigator.onLine,
        identificador: identificador,
        entity: entity,
        fields: [],
        permission: await permissionToChange(entity, data),
        button: {
            delete: (actions['delete'] ? await permissionToAction(entity, 'delete') : !1),
            update: (actions.update ? await permissionToAction(entity, 'update') : !1),
            status: {have: !1, status: !1}
        }
    };

    /**
     * Button status show or not
     */
    if (actions.status && gridContent.button.update && isNumberPositive(info.status)) {
        gridContent.button.status.have = !0;

        for(let m in dicionarios[entity]) {
            let meta = dicionarios[entity][m];
            if (meta.id === info.status) {
                if (meta.update && meta.datagrid !== !1)
                    gridContent.button.status.status = (data[meta.column] === "true" || data[meta.column] === !0 || data[meta.column] === 1 || data[meta.column] === "1");
                else
                    gridContent.button.status.have = !1;

                break;
            }
        }
    }

    for(let e of fields) {
        if (typeof data[e.column] !== "undefined") {
            let tr = {
                id: data.id,
                show: e.show,
                column: e.column,
                entity: gridContent.entity,
                style: '',
                class: '',
                checked: e.first && selecteds.indexOf(parseInt(data.id)) > -1,
                first: e.first
            };
            tr.class = getTrClass(dicionarios[entity][e.column], data[e.column]);
            tr.style = getTrStyle(dicionarios[entity][e.column], data[e.column]);
            tr.value = await gridTdFilterValue(data[e.column], data['relationData'] ?? [], dicionarios[entity][e.column]);
            gridContent.fields.push(tr);
        }
    }

    return gridContent
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

async function gridTdFilterValue(value, relationData, meta) {
    if (typeof meta !== "undefined") {
        value = !isEmpty(value) ? value : "";
        if (['select', 'radio'].indexOf(meta.format) > -1) {
            let allows = meta.allow.options.find(option => option.valor == value);
            if(typeof allows === "object" && typeof allows.representacao !== "undefined")
                value = allows.representacao;
        } else if ('checkbox' === meta.format) {
            let resposta = "";
            for (let i in meta.allow.options)
                resposta += (value.indexOf(meta.allow.options[i].valor.toString()) > -1 ? ((resposta !== "" ? ", " : "") + (!isEmpty(meta.allow.options[i]) ? meta.allow.options[i].representacao : "")) : "");

            value = resposta;
        } else if (meta.group === "boolean") {
            value = "<div class='activeBoolean" + (value == 1 ? " active" : "") + "'></div>";
        } else if (['folder', 'extend'].indexOf(meta.format) > -1) {
            return getRelevantTitle(meta.relation, value, 1, !1)
        } else if (['list', 'selecao', 'checkbox_rel', 'checkbox_mult'].indexOf(meta.format) > -1) {
            return getRelevantTitle(meta.relation, relationData[meta.column] ?? [], 1, !1)
        } else {
            value = applyFilterToTd(value, meta)
        }
    }
    return value;
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

function loadMaskTable($table) {
    maskData($table)
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
        search: "",
        filter: [],
        filterGroupIndex: 0,
        filterRegraIndex: 0,
        filterOperador: "",
        filterRegraOperador: "",
        $filterGroup: null,
        filterAggroup: "",
        filterAggroupSum: [],
        filterAggroupMedia: [],
        filterAggroupMaior: [],
        filterAggroupMenor: [],
        filterTotal: -1,
        loadingTimer: null,
        loadingHtml: "",
        actions: actions || {autor: !1, create: !0, update: !0, delete: !0, status: !0},
        fields: fields || [],
        goodName: function () {
            return function (text, render) {
                return ucFirst(replaceAll(replaceAll(render(text), "_", " "), "-", " "))
            }
        },
        putWaitingRegisters: function (registerPosition, registersWaitingPosition, $content) {
            if (registersWaitingPosition.length) {
                for (let i in registersWaitingPosition) {
                    if (registersWaitingPosition[i].position === registerPosition) {
                        $content.append(registersWaitingPosition[i].content);
                        registerPosition++;
                        registersWaitingPosition.splice(i, 1);
                        return this.putWaitingRegisters(registerPosition, registersWaitingPosition, $content);
                    }
                }
            }

            return [registerPosition, registersWaitingPosition];
        },
        applyFilters: function () {
            let $this = this;
            $this.readData()
        },
        loading: function() {
            let $this = this;
            if(!$this.$element.find(".tr-loading").length) {
                $this.$element.find(".table-all").css("opacity", ".5");
                $this.loadingHtml = $("<div class='col tr-loading' style='position: relative;height: 4px;'></div>").insertBefore($this.$element.find(".table-all"));
                $this.loadingHtml.loading();
                $this.loadingTimer = setInterval(function () {
                    $this.loadingHtml.loading()
                }, 2000);
            }
        },
        clearLoading: function() {
            this.loadingHtml.remove();
            this.$element.find(".table-all").css("opacity", 1);
            clearInterval(this.loadingTimer);
        },
        readData: async function () {
            clearHeaderScrollPosition();
            let $this = this;
            $this.$content = $this.$element.find("tbody");
            let selecteds = [];
            let offset = ($this.page * $this.limit) - $this.limit;
            let result = "";

            if ((!isEmpty($this.filter) || !isEmpty($this.filterAggroup)) && typeof reportRead !== "undefined" && USER.setor === "admin") {
                result = await reportRead(entity, !isEmpty($this.search) ? $this.search : null, $this.filter, $this.filterAggroup, $this.filterAggroupSum, $this.filterAggroupMedia, $this.filterAggroupMaior, $this.filterAggroupMenor, $this.order, $this.orderPosition, $this.limit, offset);
            } else {
                result = await db.exeRead(entity, !isEmpty($this.search) ? {"*": $this.search} : null, $this.limit, offset, $this.order, $this.orderPosition);
                result = {data: result, length: (await dbLocal.exeRead("__totalRegisters", 1))[entity]};
            }

            let info = await dbLocal.exeRead("__info", 1);
            let templates = await getTemplates();

            $this.loading();

            if ($this.$content.find(".table-select:checked").length > 0) {
                $.each($this.$content.find(".table-select:checked"), function (i, e) {
                    selecteds.push(parseInt($(this).attr("rel")))
                })
            }

            $(".table-info-result").remove();
            $this.$content.parent().find("thead").removeClass("hide");

            if (typeof info !== "undefined") {
                let totalFormated = "";
                let total = result.length.toString();
                let le = total.length;
                for (let i = 0; i < le; i++)
                    totalFormated += (i > 0 && (le - i) % 3 === 0 ? "." : "") + total[i];
                $this.$element.find(".total").html(totalFormated + " registro" + (totalFormated > 1 ? "s" : ""));
                $this.filterTotal = -1;
                let pp = [];
                let registerPosition = 0;
                let registersWaitingPosition = [];
                $this.$content.html("");

                for (let k in result.data) {
                    if (typeof result.data[k] === "object" && !isEmpty(result.data[k])) {
                        pp.push(gridTr($this.identificador, entity, result.data[k], $this.fields, info[entity], grid.actions, selecteds).then(tr => {
                            if (parseInt(k) === registerPosition) {
                                $this.$content.append(Mustache.render(templates.grid_content, tr))
                                registerPosition++;
                                if (registersWaitingPosition.length) {
                                    let r = $this.putWaitingRegisters(registerPosition, registersWaitingPosition, $this.$content);
                                    registerPosition = r[0];
                                    registersWaitingPosition = r[1];
                                }
                            } else {
                                registersWaitingPosition.push({
                                    position: parseInt(k),
                                    content: Mustache.render(templates.grid_content, tr)
                                });
                            }
                        }))
                    }
                }
                return Promise.all(pp).then(d => {
                    if (isEmpty(d)) {
                        $this.$content.parent().find("thead").addClass("hide");
                        $this.$content.parent().after(Mustache.render(templates.no_registers));
                    }
                    $this.clearLoading();
                    $this.posData()
                })
            } else {
                $this.clearLoading();
            }
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
            var pF = (isEmpty(grid.fields) ? getFields(entity, !0, 'grid') : new Promise());
            let perm = permissionToAction(this.entity, 'read');
            let sync = dbLocal.exeRead("sync_" + this.entity);
            return Promise.all([pT, perm, pF, sync]).then(r => {

                if (isEmpty(grid.fields))
                    this.fields = r[2];

                if (!r[1])
                    return "<h2 class='align-center padding-32 color-text-gray-dark'>Sem Permissao para Leitura</h2>"

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

                    return getTemplates().then(templates => {
                        if (SERVICEWORKER) {

                            this.total = r[0].length;
                            let haveSync = r[3].length > 0 && navigator.onLine ? r[3].length : 0;
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
                        } else {

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
                        }
                    })
                })
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
            let $this = this;
            loadMaskTable($this.$content);
            clearForm();

            $this.$element.find(".pagination").remove();
            let total = parseInt($this.$element.find(".total").html().replace(".", "").replace(".", "").replace(".", ""));
            if (total > $this.limit) {
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

            /**
             * Add filter option if is admin
             */
            if(USER.setor === "admin") {
                let $sum = $this.$element.find(".sum-aggroup");
                if (!$this.$element.find(".aggroup").find("option").length) {
                    let $aggroup = $this.$element.find(".aggroup").html("<option value='' selected='selected'>agrupar por...</option>");

                    for (let col in dicionarios[$this.entity]) {
                        $aggroup.append("<option value='" + col + "'>" + dicionarios[$this.entity][col].nome + "</option>");

                        if (["identifier", "information", "publisher"].indexOf(dicionarios[$this.entity][col].key) === -1)
                            $sum.append("<div class='left relative padding-right' style='margin-top: -5px'><select class='theme-text-aux aggreted-field-type' data-rel='" + identificador + "' rel='" + col + "'><option value='' class='theme-text'>" + dicionarios[$this.entity][col].nome + "</option><option value='soma' class='theme-text'>soma</option><option value='media' class='theme-text'>média</option><option value='maior' class='theme-text'>maior</option><option value='menor' class='theme-text'>menor</option></select></div>");
                    }
                }

                $this.$element.find(".btn-table-filter").removeClass("hide");
            }
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