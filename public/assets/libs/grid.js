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
            delete: (actions['delete'] ? await havePermission(entity, data, 'delete') : !1),
            update: (actions.update ? await havePermission(entity, data, 'update') : !1),
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
        } else if (meta.key === "valor") {
            value = "R$ " + formatMoney(value, 2, ',', '.');
        } else if (meta.type === "float" || meta.type === "decimal") {
            value = !isEmpty(value) ? formatMoney(value, 2, ',', '.') : 0;
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
        updateTotalTable: async function() {
            let $this = this;
            let totalReg = await dbLocal.exeRead("__totalRegisters", 1);
            let total = (typeof totalReg[$this.entity] !== "undefined" ? totalReg[$this.entity].toString() : 0);
            let totalFormated = "";
            let le = total.length;
            for (let i = 0; i < le; i++)
                totalFormated += (i > 0 && (le - i) % 3 === 0 ? "." : "") + total[i];

            $this.$element.find(".total").html(totalFormated + " registro" + (total > 1 ? "s" : ""));
        },
        readData: async function () {
            let $this = this;
            $this.$content = $this.$element.find("tbody");

            /**
             * Get data results
             */
            let offset = ($this.page * $this.limit) - $this.limit;
            let result = [];
            if ((!isEmpty($this.filter) || !isEmpty($this.filterAggroup)) && typeof reportRead !== "undefined" && USER.setor === "admin") {
                result = await reportRead(entity, !isEmpty($this.search) ? $this.search : null, $this.filter, $this.filterAggroup, $this.filterAggroupSum, $this.filterAggroupMedia, $this.filterAggroupMaior, $this.filterAggroupMenor, $this.order, $this.orderPosition, $this.limit, offset);
            } else {
                result = await db.exeRead(entity, !isEmpty($this.search) ? {"*": $this.search} : null, $this.limit, offset, $this.order, $this.orderPosition);
            }

            let info = await dbLocal.exeRead("__info", 1);
            let templates = await getTemplates();

            $this.loading();

            let selecteds = [];
            if ($this.$content.find(".table-select:checked").length > 0) {
                $.each($this.$content.find(".table-select:checked"), function (i, e) {
                    selecteds.push(parseInt($(this).attr("rel")))
                })
            }

            $(".table-info-result").remove();
            $this.$content.parent().find("thead").removeClass("hide");

            if (typeof info !== "undefined") {
                $this.filterTotal = -1;
                let pp = [];
                let registerPosition = 0;
                let registersWaitingPosition = [];
                $this.$content.html("");

                for (let k in result) {
                    if (typeof result[k] === "object" && !isEmpty(result[k])) {
                        pp.push(gridTr($this.identificador, entity, result[k], $this.fields, info[entity], grid.actions, selecteds).then(tr => {
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
            let pT = dbLocal.keys(entity);
            let pF = (isEmpty(grid.fields) ? getFields(entity, !0, 'grid') : new Promise());
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
        posData: async function () {
            let $this = this;
            loadMaskTable($this.$content);
            clearForm();

            await $this.updateTotalTable();

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
                        $aggroup.append("<option value='" + col + "'>" + (col === "system_id" ? "Sistema" : dicionarios[$this.entity][col].nome) + "</option>");

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

function deleteBadge(id, identificador) {
    if (tempoDigitacao)
        clearTimeout(tempoDigitacao);
    let $badge = $("#" + id);
    $badge.css("width", $badge.css("width")).removeClass("padding-small").addClass("padding-4");
    $badge.css("width", 0);
    setTimeout(function () {
        let $filter = $badge.closest(".filter-logic");
        let $filterParent = $filter.closest("#filter-logic");
        if ($filter.find(".filter_badge").length === 1) {
            if ($filter.prev(".inner_div").length)
                $filter.prev(".inner_div").remove();

            $filter.remove();
            if ($filterParent.find(".filter-logic").length) {
                $(".btn-new-group[rel='" + identificador + "']").removeClass("disabled").removeAttr("disabled");
            } else {
                $(".btn-new-group[rel='" + identificador + "']").addClass("disabled").attr("disabled", "disabled");
                $(".btn-new-group[data-rel='group'][rel='" + identificador + "']").removeClass("disabled").removeAttr("disabled");
            }
        }

        $badge.remove();
    }, 250)
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

$(function () {
    $("#app").off("click", ".btn-table-filter").on("click", ".btn-table-filter", function () {
        let grid = grids[$(this).attr("rel")];
        let $filter = grid.$element.find(".table-filter");
        if ($filter.css("height") === "0px") {
            $filter.css("height", "auto");
            let h = $filter.css("height");
            $filter.css("height", 0);
            $filter.css("height", h);
            setTimeout(function () {
                $filter.css("height", "auto")
            }, 300)
        } else {
            $filter.css("height", $filter.css("height"));
            $filter.css("height", 0);
            $filter.find(".table-filter-operator, .table-filter-value, .table-filter-btn").addClass("hide");
            $filter.find(".table-filter-operator").val("");
            $filter.find(".table-filter-value").val("")
        }
        $filter.find(".table-filter-columns").html("<option disabled='disabled' class='color-text-gray' selected='selected' value=''>coluna...</option>");
        $.each(dicionarios[grid.entity], function (col, meta) {
            $filter.find(".table-filter-columns").append("<option value='" + col + "' >" + (col === "system_id" ? "Sistema" : meta.nome) + "</option>")
        })
    }).off("change", ".table-filter-operator").on("change", ".table-filter-operator", function () {
        if ($(this).val() !== "")
            $(this).siblings(".table-filter-value").removeClass("hide").focus()
    }).off("change keyup", ".table-filter-value").on("change keyup", ".table-filter-value", function (e) {
        if ($(this).val() !== "") {
            if (e.which === 13)
                $(this).siblings(".table-filter-btn").find(".btn-table-filter-apply").trigger("click"); else $(this).siblings(".table-filter-btn").removeClass("hide")
        } else {
            $(this).siblings(".table-filter-btn").addClass("hide")
        }
    }).off("click", ".btn-close-modal").on("click", ".btn-close-modal", function () {
        let grid = grids[$(this).attr("rel")];
        grid.$element.find(".modal-filter, .modal-grafico").addClass("hide");

    }).off("click", ".btn-group-remove").on("click", ".btn-group-remove", function () {
        let identificador = $(this).attr("rel");
        let $filter = $(this).closest(".filter-logic");
        let $filterParent = $filter.closest("#filter-logic");
        if ($filter.prev(".inner_div").length)
            $filter.prev(".inner_div").remove();
        $filter.remove();

        if ($filterParent.find(".filter-logic").length) {
            $(".btn-new-group[rel='" + identificador + "']").removeClass("disabled").removeAttr("disabled");
        } else {
            $(".btn-new-group[rel='" + identificador + "']").addClass("disabled").attr("disabled", "disabled");
            $(".btn-new-group[data-rel='group'][rel='" + identificador + "']").removeClass("disabled").removeAttr("disabled");
        }

    }).off("click", ".btn-new-group").on("click", ".btn-new-group", function () {
        let identificador = $(this).attr("rel");
        let grid = grids[identificador];
        grid.filterRegraOperador = $(this).attr("data-rel");
        let nameRegra = (grid.filterRegraOperador === "inner_join" ? "grupo de inclusão" : "grupo de exclusão");
        let $logic = grid.$element.find("#filter-logic");
        grid.$element.find(".btn-new-group").addClass("disabled").attr("disabled", "disabled");
        getTemplates().then(tpl => {
            if (grid.filterRegraOperador !== "group") {
                let $grupoFieldDic = $("<div class='col inner_div'><hr class='col'><div class='left font-small' style='margin: -15px 0 4px 5px'>" + nameRegra + "</div><div class='left font-small grupo-join-field' style='margin: -24px 0 4px 5px;'></div></div>").appendTo($logic);
                let $grupoField = $("<select class='theme-text-aux grupo-join-field-select' rel='" + identificador + "'><option value='id' class='theme-text'>id</option></select>").appendTo($grupoFieldDic.find(".grupo-join-field"));

                for(let i in dicionarios[grid.entity])
                    $grupoField.append("<option value='" + i + "' class='theme-text'>" + dicionarios[grid.entity][i].nome + "</option>")
            }
            $logic.append(Mustache.render(tpl.filter_group, {identificador: identificador}));
        });

    }).off("click", ".btn-new-filter-and").on("click", ".btn-new-filter-and", function () {
        let grid = grids[$(this).attr("rel")];
        grid.$filterGroup = $(this).closest(".filter-logic");
        grid.filterOperador = "e";
        grid.filterGroupIndex = 0;
        grid.filterRegraIndex = 0;

        let findGroupIndex = !0;
        grid.$filterGroup.prevAll().each(function (i, e) {
            if ($(e).hasClass("inner_div")) {
                grid.filterRegraIndex++;
                findGroupIndex = !1;
            }

            if (findGroupIndex)
                grid.filterGroupIndex++;
        });

        grid.$element.find(".modal-filter").removeClass("hide");

    }).off("click", ".btn-new-filter-or").on("click", ".btn-new-filter-or", function () {
        let grid = grids[$(this).attr("rel")];
        grid.$filterGroup = $(this).closest(".filter-logic");
        grid.filterOperador = "ou";
        grid.filterGroupIndex = 0;
        grid.filterRegraIndex = 0;

        let findGroupIndex = !0;
        grid.$filterGroup.prevAll().each(function (i, e) {
            if ($(e).hasClass("inner_div")) {
                grid.filterRegraIndex++;
                findGroupIndex = !1;
            }

            if (findGroupIndex)
                grid.filterGroupIndex++;
        });

        grid.$element.find(".modal-filter").removeClass("hide");

    }).off("click", ".btn-table-filter-apply").on("click", ".btn-table-filter-apply", function () {
        let grid = grids[$(this).attr("rel")];
        let operador = grid.filterOperador;
        let $filter = grid.$element.find(".table-filter");

        /**
         * visualização dos botões de grupo e join
         */
        grid.$element.find(".btn-new-group").removeClass("disabled").removeAttr("disabled");
        grid.$filterGroup.find(".btn-group-remove").remove();

        /**
         * Cria dados do novo filtro
         */
        let title = grid.filterOperador + " => " + $filter.find(".table-filter-columns").last().val() + " " + $filter.find(".table-filter-operator").val() + " " + $filter.find(".table-filter-value").val();
        let filter = {
            logica: grid.filterOperador === "e" ? "and" : "or",
            coluna: $filter.find(".table-filter-columns").last().val(),
            colunas: [],
            operador: $filter.find(".table-filter-operator").val(),
            valor: $filter.find(".table-filter-value").val(),
            entidades: [],
            identificador: grid.identificador,
            id: Date.now() + Math.floor((Math.random() * 1000)),
            columnTituloExtend: "<small class='color-gray left opacity padding-tiny radius'>regra</small><span style='padding: 1px 5px' class='left padding-right font-medium td-title'> " + title + "</span>",
            columnName: 'filtros',
            columnRelation: 'relatorios_filtro',
            columnStatus: {column: '', have: !1, value: !1}
        };

        $filter.find(".table-filter-columns").each(function (i, e) {
            filter.colunas.push($(e).val());
            filter.entidades.push($(e).data("entity"));
        });
        filter.colunas = JSON.stringify(filter.colunas);
        filter.entidades = JSON.stringify(filter.entidades);

        /**
         * Conversão de data no formato dd/mm/YY
         */
        let rDataHora = new RegExp("\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d\\s\\d\\d", "i");
        let rData = new RegExp("\\d\\d\\/\\d\\d\\/\\d\\d\\d\\d", "i");
        if (rDataHora.test(filter.value)) {
            let t = filter.value.split(' ');
            let d = t[0].split('/');
            filter.value = d[2] + "-" + d[1] + "-" + d[0] + "T" + t[1]
        } else if (rData.test(filter.value)) {
            let d = filter.value.split('/');
            filter.value = d[2] + "-" + d[1] + "-" + d[0]
        }

        /**
         * Adiciona filtro a lista de filtros no controller
         */
        if (grid.filterRegraOperador !== "group") {
            grid.filter.push({
                tipo: grid.filterRegraOperador,
                tipoColumn: grid.$filterGroup.prevAll(".inner_div").first().find(".grupo-join-field-select").val(),
                grupos: [],
                identificador: grid.identificador,
                id: Date.now() + Math.floor((Math.random() * 1000)),
                columnTituloExtend: "<small class='color-gray left opacity padding-tiny radius'>tipo</small><span style='padding: 1px 5px' class='left padding-right font-medium td-title'> " + grid.filterRegraOperador + "</span>",
                columnName: 'regras',
                columnRelation: 'relatorios_regras',
                columnStatus: {column: '', have: !1, value: !1}
            });
            grid.filterRegraOperador = "group";
        } else if (isEmpty(grid.filter)) {
            grid.filter.push({
                tipo: 'select',
                tipoColumn: "",
                grupos: [],
                identificador: grid.identificador,
                id: Date.now() + Math.floor((Math.random() * 1000)),
                columnTituloExtend: "<small class='color-gray left opacity padding-tiny radius'>tipo</small><span style='padding: 1px 5px' class='left padding-right font-medium td-title'> select</span>",
                columnName: 'regras',
                columnRelation: 'relatorios_regras',
                columnStatus: {column: '', have: !1, value: !1}
            });
        }

        if (typeof grid.filter[grid.filterRegraIndex].grupos[grid.filterGroupIndex] === "undefined") {
            grid.filter[grid.filterRegraIndex].grupos.push({
                filtros: [],
                identificador: grid.identificador,
                id: Date.now() + Math.floor((Math.random() * 1000)),
                columnTituloExtend: "<small class='color-gray left opacity padding-tiny radius'>grupo</small><span style='padding: 1px 5px' class='left padding-right font-medium td-title'> " + (grid.filter[grid.filterRegraIndex].grupos.length + 1) + "</span>",
                columnName: 'grupos',
                columnRelation: 'relatorios_grupos',
                columnStatus: {column: '', have: !1, value: !1}
            });
        }

        grid.filter[grid.filterRegraIndex].grupos[grid.filterGroupIndex].filtros.push(filter);

        /**
         * Limpa os campos e fecha a interface de novo filtro
         */
        $filter.find(".table-filter-operator, .table-filter-value, .table-filter-btn, .table-filter-operator > .dateOption").addClass("hide");
        $filter.find(".table-filter-columns, .table-filter-operator, .table-filter-value").val("");
        $filter.find(".table-filter-columns:eq(0)").nextAll(".table-filter-columns").remove();

        /**
         * Adiciona filtro a lista de filtros na UI
         */
        getTemplates().then(templates => {
            let showOperador = grid.$filterGroup.prev(".filter-logic").length || grid.$filterGroup.find(".filter_badge").length;
            return grid.$filterGroup.find("#filter_group_logic").append(Mustache.render(templates.filter_badge, Object.assign({
                operadorName: operador,
                showOperador: showOperador
            }, filter)));

        }).then(d => {
            grid.$element.find(".modal-filter").addClass("hide");
            grid.readData()
        });

    }).off("change", ".grupo-join-field-select").on("change", ".grupo-join-field-select", function () {
        let $inner = $(this).closest(".inner_div");
        let grid = grids[$(this).attr("rel")];
        let index = grid.$element.find("#filter-logic").find(".inner_div").index($inner);

        if(typeof grid.filter[index+1] === "object")
            grid.filter[index+1].tipoColumn = $(this).val();

    }).off("click", ".btn-badge-remove").on("click", ".btn-badge-remove", function () {
        let identificador = $(this).attr("rel");
        let grid = grids[identificador];
        let id = $(this).attr("data-badge");

        let del = !1;
        if (!isEmpty(grid.filter)) {
            for (let i in grid.filter) {
                if (!isEmpty(grid.filter[i].grupos)) {
                    for (let ii in grid.filter[i].grupos) {
                        if (!isEmpty(grid.filter[i].grupos[ii].filtros)) {
                            for (let iii in grid.filter[i].grupos[ii].filtros) {

                                /**
                                 * Encontrou item do filtro para ser removido
                                 */
                                if (grid.filter[i].grupos[ii].filtros[iii].id == id) {
                                    grid.filter[i].grupos[ii].filtros.splice(iii, 1);
                                    del = !0;
                                    break;
                                }
                            }
                        }

                        /**
                         * Verifica se o grupo ficou vazio para excluir também
                         */
                        if (del) {
                            if (isEmpty(grid.filter[i].grupos[ii].filtros))
                                grid.filter[i].grupos.splice(ii, 1);

                            break;
                        }
                    }
                }

                /**
                 * Verifica se a regra ficou vazia para excluir também
                 */
                if (del) {
                    if (isEmpty(grid.filter[i].grupos))
                        grid.filter.splice(i, 1);

                    break;
                }
            }
        }

        /**
         * Deleta DOM, e lê novamente a tabela
         */
        if (del) {
            deleteBadge(id, identificador);
            grid.readData();
        }

    }).off("change", ".table-filter-columns").on("change", ".table-filter-columns", function () {
        let $this = $(this);
        let column = $this.val();
        if (column !== "") {
            let entity = $this.data("entity");
            let identificador = $this.attr("rel");

            if (dicionarios[entity][column].key === "relation") {
                let $selectRelation = $('<select class="col s12 m3 table-filter-columns" data-entity="' + dicionarios[entity][column].relation + '" data-rel="' + ($this.siblings(".table-filter-columns").length + 1) + '" rel="' + identificador + '"></select>').insertAfter($this);
                $selectRelation.html("<option disabled='disabled' class='color-text-gray' selected='selected' value=''>coluna...</option>");
                $.each(dicionarios[dicionarios[entity][column].relation], function (col, meta) {
                    $selectRelation.append("<option value='" + col + "' >" + meta.nome + "</option>")
                });
                $this.siblings(".table-filter-operator").addClass("hide");
            } else {
                if(dicionarios[entity][column].format === "datetime" || dicionarios[entity][column].format === "date")
                    $(".table-filter-operator > .dateOption").removeClass("hide");
                else
                    $(".table-filter-operator > .dateOption").addClass("hide");

                $this.siblings(".table-filter-operator").removeClass("hide");
                $this.nextAll(".table-filter-columns").remove();
            }
        }

    }).off("change", ".aggroup").on("change", ".aggroup", function () {
        let identificador = $(this).attr("rel");
        let grid = grids[identificador];
        grid.filterAggroup = $(this).val();

        if(grid.filterAggroup !== "") {
            grid.$element.find(".sum-aggroup").removeClass("hide");
        } else {
            grid.$element.find(".sum-aggroup").addClass("hide");
            grid.filterAggroupSum = [];
            grid.filterAggroupMedia = [];
            grid.filterAggroupMaior = [];
            grid.filterAggroupMenor = [];
        }

        grid.readData();

    }).off("change", ".aggreted-field-type").on("change", ".aggreted-field-type", function () {
        let identificador = $(this).attr("data-rel");
        let grid = grids[identificador];

        grid.filterAggroupSum = [];
        grid.filterAggroupMedia = [];
        grid.filterAggroupMaior = [];
        grid.filterAggroupMenor = [];
        $(".aggreted-field-type").each(function(i, e) {
            switch ($(e).val()) {
                case 'soma':
                    grid.filterAggroupSum.push($(e).attr("rel"));
                    break;
                case 'media':
                    grid.filterAggroupMedia.push($(e).attr("rel"));
                    break;
                case 'maior':
                    grid.filterAggroupMaior.push($(e).attr("rel"));
                    break;
                case 'menor':
                    grid.filterAggroupMenor.push($(e).attr("rel"));
                    break;
            }
        });

        grid.readData();

    }).off("click", "#gerar-relatorio").on("click", "#gerar-relatorio", function () {
        let nome = "";
        if (nome = prompt("Dê um nome para o relatório:")) {
            let id = $(this).attr("rel");
            let grid = grids[id];

            db.exeCreate("relatorios", {
                nome: nome,
                entidade: grid.entity,
                search: grid.search,
                regras: JSON.stringify(grid.filter),
                ordem: grid.order,
                decrescente: grid.orderPosition,
                agrupamento: grid.filterAggroup,
                soma: JSON.stringify(grid.filterAggroupSum),
                media: JSON.stringify(grid.filterAggroupMedia),
                maior: JSON.stringify(grid.filterAggroupMaior),
                menor: JSON.stringify(grid.filterAggroupMenor),
                fields: JSON.stringify(grid.fields)
            }).then(() => {
                toast("Relatório Criado", 2500, "toast-success")
            })
        }

    }).off("click", "#gerar-card-informativo").on("click", "#gerar-card-informativo", function () {
        let nome = "";

        /**
         * Obtém um titulo para o card de relatório
         */
        if (nome = prompt("Dê um nome para seu Card informativo:")) {
            let id = $(this).attr("rel");
            let grid = grids[id];

            /**
             * Obtém a cor de theme-d1 para adicionar como a cor padrão do card relatórios
             */
            let cor = $(".theme-d1").length ? $(".theme-d1").css("background-color") : THEME;
            let cortexto = $(".theme-d1").length ? $(".theme-d1").css("color") : THEMETEXT;

            let hexDigits = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"];

            function hex(x) {
                return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
            }

            //Function to convert rgb color to hex format
            function rgb2hex(rgb) {
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            }

            if(!/^#/.test(cor))
                cor = rgb2hex(cor);

            if(!/^#/.test(cortexto))
                cortexto = rgb2hex(cortexto);

            /**
             * Cria card no banco
             */
            db.exeCreate("relatorios_card", {
                nome: nome,
                entidade: grid.entity,
                regras: JSON.stringify(grid.filter),
                ordem: grid.order,
                decrescente: grid.orderPosition,
                agrupamento: grid.filterAggroup,
                soma: JSON.stringify(grid.filterAggroupSum),
                media: JSON.stringify(grid.filterAggroupMedia),
                maior: JSON.stringify(grid.filterAggroupMaior),
                menor: JSON.stringify(grid.filterAggroupMenor),
                cor_de_fundo: cor,
                cor_do_texto: cortexto,
                icone: ""
            }).then(() => {
                toast("Card Informativo Criado", 2500, "toast-success")
            })
        }
    })
})