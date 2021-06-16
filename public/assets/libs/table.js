var tempoDigitacao = null;

function getDataRelation(entity, dados, pretty) {
    return Promise.all([]).then(() => {
        if (dados !== null && dados !== "") {
            let dadosRelation = [];
            if (typeof dados === "object" && dados.constructor === Object) {
                delete dados.id;
                delete dados.columnStatus;
                delete dados.columnName;
                delete dados.columnRelation;
                delete dados.formIdentificador;
                delete dados.columnTituloExtend;
                dadosRelation.push(dados);
            } else {
                $.each(dados, function (i, e) {
                    delete e.id;
                    delete e.columnStatus;
                    delete e.columnName;
                    delete e.columnRelation;
                    delete e.formIdentificador;
                    delete e.columnTituloExtend;
                    dadosRelation.push(e);
                })
            }

            return getDataExtended(entity, dadosRelation, pretty);
        }
    });
}

function getDataExtended(entity, dados, pretty) {
    pretty = typeof pretty !== "undefined" && [!0, "true", "1", 1].indexOf(pretty) > -1;
    let data = [];
    let promessas = [];
    $.each(dados, function (i, e) {
        if (typeof e === "object" && e !== null) {
            delete e.db_action;
            delete e.db_status;

            data.push(e);
            $.each(e, function (j, d) {
                //existe este campo
                if (!isEmpty(dicionarios[entity][j])) {

                    //relação associação
                    /*if (dicionarios[entity][j].key === 'relation' && dicionarios[entity][j].format === "list") {
                        //relação de associação
                        delete e[j];
                        if (d !== null && !isNaN(d)) {
                            promessas.push(db.exeRead(dicionarios[entity][j].relation, parseInt(d)).then(dadosRelation => {
                                let dadosRelations = [];
                                dadosRelations.push(dadosRelation);
                                return getDataExtended(dicionarios[entity][j].relation, dadosRelations, pretty).then(ret => {
                                    if (pretty) {
                                        return getDataRelation(dicionarios[entity][j].relation, ret[0], pretty).then(result => {
                                            $.each(result, function (aa, bb) {
                                                $.each(bb, function (bbb, ccc) {
                                                    e[j + " 01 " + bbb] = ccc;
                                                })
                                            });
                                        });
                                    } else {
                                        e[j] = ret[0];
                                    }
                                })
                            }))
                        }

                    } else if (dicionarios[entity][j].key === 'relation' && dicionarios[entity][j].type === "json") {*/

                    //relação importação
                    if (dicionarios[entity][j].key === 'relation' && dicionarios[entity][j].type === "json") {
                        //relação de importação do registro Json format
                        delete e[j];

                        if(typeof d === "string" && isJson(d))
                            d = JSON.parse(d);

                        if(d !== null && typeof d === "object" && !isEmpty(d)) {
                            if (pretty) {
                                promessas.push(getDataRelation(dicionarios[entity][j].relation, d, pretty).then(result => {
                                    $.each(result, function (aa, bb) {
                                        $.each(bb, function (bbb, ccc) {
                                            e[j + " " + zeroEsquerda(aa + 1) + " " + bbb] = ccc;
                                        })
                                    });
                                }));
                            } else {
                                let dadosRelations = [];
                                dadosRelations.push(d);
                                promessas.push(getDataExtended(dicionarios[entity][j].relation, dadosRelations, pretty).then(ret => {
                                    e[j] = ret[0]
                                }))
                            }
                        }
                    } else if(pretty && dicionarios[entity][j].key === 'source') {
                        e[j] = "";

                        //obtém column title to set in image name
                        let title = null;
                        $.each(dicionarios[entity], function (iii, h) {
                            if(h.format === "title") {
                                title = h.column;
                                return;
                            }
                        });
                        if(typeof d === "string" && isJson(d))
                            d = JSON.parse(d);
                        $.each(d, function (ii, source) {
                            if(title)
                                source.url += "&title=" + slug(e[title]) + (d.length > 1 ? "-" + ii : "");
                            e[j] += (e[j] !== "" ? ", " : "") + source.url
                        })
                    }
                }
            })
        }
    });
    return Promise.all(promessas).then(() => {
        return data
    })
}

function downloadData(grid, pretty) {
    let offset = (grid.page * grid.limit) - grid.limit;

    toast("Preparando Download...", 1500);
    let ids = [];
    if (grid.$content.find(".table-select:checked").length) {
        $.each(grid.$content.find(".table-select:checked"), function (i, e) {
            $(e).prop("checked", !1);
            ids.push(parseInt($(e).attr("rel")))
        })
    }

    let read = new Read();
    read.setOrderColumn(grid.order);
    read.setLimit(grid.limit);
    read.setOffset(offset);
    read.setFilter(grid.search);
    if(grid.orderPosition)
        read.setOrderReverse();

    read.exeRead(grid.entity).then(result => {
        if (result.length > 0) {
            let results = [];
            if (!isEmpty(result) && ids.length) {
                for(let e of result) {
                    if (ids.indexOf(parseInt(e.id)) > -1)
                        results.push(e)
                }
            } else {
                results = result
            }

            toast("Processando dados para exportar", 5000);
            getDataExtended(grid.entity, results, pretty).then(dd => {
                toast(results.length + " registros exportados", 3000, "toast-success");
                let d = new Date();
                download(grid.entity + "-" + zeroEsquerda(d.getDate()) + "-" + zeroEsquerda(d.getMonth() + 1) + "-" + d.getFullYear() + ".csv", CSV(dd))
            })
        } else {
            toast("Nenhum registro selecionado", 2000, "toast-warning")
        }
    });
}

$(function () {
    $("#app").off("click", ".table-reload").on("click", ".table-reload", function () {
        let grid = grids[$(this).attr("rel")];
        grid.readData();

    }).off("click", ".grid-order-by").on("click", ".grid-order-by", function () {
        let grid = grids[$(this).attr("rel")];
        grid.$element.find(".grid-order-by-arrow").remove();
        if (grid.order === $(this).attr("data-column")) {
            grid.orderPosition = !grid.orderPosition
        } else {
            grid.order = $(this).attr("data-column");
            grid.orderPosition = !1
        }
        if (grid.orderPosition)
            $(this).append("<i class='material-icons grid-order-by-arrow left padding-8'>arrow_drop_down</i>");
        else
            $(this).append("<i class='material-icons grid-order-by-arrow left padding-8'>arrow_drop_up</i>");

        grid.readData()

    }).off("click", ".btn-grid-sync").on("click", ".btn-grid-sync", function () {
        if (navigator.onLine) {
            let $this = $(this);
            let grid = grids[$this.attr("data-id")];

            if(grid.$content.find(".table-select:checked").length) {
                /**
                 * Checkbox checked, mult sync
                 * */
                if(confirm("Sincronizar os " + grid.$content.find(".table-select:checked").length + " registros selecionados?")) {
                    $.each(grid.$content.find(".table-select:checked"), function (i, e) {
                        $(e).prop("checked", !1);
                        _dbRemote.sync(grid.entity, parseInt($(e).attr("rel")), !0).then(() => {
                            grid.readData()
                        })
                    });
                }
            } else {

                /**
                 * Single sync click
                 * */
                _dbRemote.sync(grid.entity, parseInt($this.attr("rel")), !0).then(() => {
                    grid.readData()
                })
            }
        } else {
            toast("Sem Conexão", 3000, 'toast-warning')
        }

    }).off("change", ".switch-status-table").on("change", ".switch-status-table", function () {
        let $this = $(this);
        let grid = grids[$this.attr("rel")];
        let valor = $this.attr("data-status") === "false";
        dbLocal.exeRead('__info', 1).then(info => {
            $.each(dicionarios[grid.entity], function (column, meta) {
                if (meta.id === info[grid.entity].status) {
                    $this.attr("data-status", valor);
                    let proccessPromisses = [];
                    dbLocal.exeRead(grid.entity, parseInt($this.attr("data-id"))).then(data => {
                        data[column] = valor ? 1 : 0;
                        proccessPromisses.push(db.exeCreate(grid.entity, data));
                    });
                    if (grid.$content.find(".table-select:checked").length > 0) {
                        $.each(grid.$content.find(".table-select:checked"), function () {
                            let id = parseInt($(this).attr("rel"));
                            let $switch = grid.$element.find(".switch-status-table[data-id='" + id + "']");
                            $switch.attr("data-status", valor).prop("checked", valor)
                            proccessPromisses.push(dbLocal.exeRead(grid.entity, id).then(data => {
                                data[column] = valor ? 1 : 0;
                                return db.exeCreate(grid.entity, data)
                            }));
                        })
                    }

                    return Promise.all(proccessPromisses).then(() => {
                        grid.$element.find(".table-select, .table-select-all").prop("checked", !1);
                        setTimeout(function () {
                            _dbRemote.syncPost(grid.entity);
                        },300);
                        return !1
                    })

                }
            })
        });

    }).off("change keyup", ".table-campo-geral").on("change keyup", ".table-campo-geral", function () {
        let $this = $(this);
        if (tempoDigitacao)
            clearTimeout(tempoDigitacao);

        tempoDigitacao = setTimeout(function () {
            let grid = grids[$this.attr("data-id")];
            if(typeof grid !== "undefined") {
                grid.search = $this.val();
                grid.readData();
            }
        }, 350);
    }).off("change", ".tableLimit").on("change", ".tableLimit", function () {
        let grid = grids[$(this).attr("data-id")];
        localStorage.limitGrid = parseInt($(this).val());
        grid.readDataConfigAltered(localStorage.limitGrid)

    }).off("change", ".table-select-all").on("change", ".table-select-all", function () {
        let grid = grids[$(this).attr("data-id")];
        grid.$content.find(".table-select").prop("checked", $(this).is(":checked"))

    }).off("click", ".table-select").on("click", ".table-select", function (evt) {
        let all = !0;
        let $this = $(this);
        let grid = grids[$this.attr("data-id")];
        let action = $this.is(":checked");

        /**
         * Ctrl ou Shift pressionado, seleciona os checkbox no intervalo
         * */
        if((evt.ctrlKey || evt.shiftKey) && grid.$content.find(".table-select:checked").length > 1) {
            let first = grid.$content.find(".table-select").index(grid.$content.find(".table-select:checked").first());
            let last = grid.$content.find(".table-select").index($this);

            if(action) {
                for (let i = first + 1; i < last; i++)
                    grid.$content.find(".table-select:eq(" + i + ")").prop("checked", !0);
            } else {
                for (let i = last + 1; i < grid.$content.find(".table-select").length; i++)
                    grid.$content.find(".table-select:eq(" + i + ")").prop("checked", !1);
            }
        }

        /**
         * Verifica se todos foram marcados para marcar a caixa de todos, e vice-versa
         * */
        $.each(grid.$content.find(".table-select"), function () {
            if (all && $(this).is(":checked") !== $this.is(":checked"))
                all = !1
        });
        grid.$element.find(".table-select-all").prop("checked", (all && $this.is(":checked")));

    }).off("click", ".btn-grid-delete").on("click", ".btn-grid-delete", function () {
        let grid = grids[$(this).attr("data-id")];
        let cont = grid.$content.find(".table-select:checked").length;
        if (confirm(cont > 1 ? "Remover os " + cont + " Registros?" : "Remover este Registro? ")) {
            toast("Requisitando remoção...", 15000);
            let ids = [];
            if (cont > 0) {
                $.each(grid.$content.find(".table-select:checked"), function () {
                    ids.push(parseInt($(this).attr("rel")))
                })
            } else {
                ids.push(parseInt($(this).attr("rel")))
            }
            grid.$element.find(".table-select, .table-select-all").prop("checked", !1);
            db.exeDelete(grid.entity, ids).then(() => {
                toast("Registros excluídos", 1500, "toast-success");
            })
        }

    }).off("click", ".showHideField").on("click", ".showHideField", function () {
        let $this = $(this);
        let val = $this.val();
        let checked = $this.is(":checked");
        let identificador = $this.data("rel");
        let grid = grids[identificador];
        let th = grid.$element.find("thead").find("th[rel='" + val + "']");
        let td = grid.$element.find("tbody").find("td[rel='" + val + "']");

        grid.fields.find(s => s.column === val).show = checked;
        AJAX.post("saveFieldsGrid", {type: "grid", entity: grid.entity, fields: grid.fields}).catch(() => {});

        if(checked) {
            th.removeClass("hide");
            td.removeClass("hide");
        } else {
            th.addClass("hide");
            td.addClass("hide");
        }

    }).off("click", ".table-header-option").on("click", ".table-header-option", function () {
        let $this = $(this);
        let identificador = $this.data("rel");
        let grid = grids[identificador];

        getTemplates().then(tpl => {
            $this.closest(".table-all").before(Mustache.render(tpl.grid_content_card_header, {
                identificador: $this.data("rel"),
                entity: $this.data("entity"),
                columns: grid.fields
            }));
            let $cardHeader = $(".grid_content_card_header");
            $(document).on("mouseup", function(e) {
                if (!$cardHeader.is(e.target) && $cardHeader.has(e.target).length === 0) {
                    $cardHeader.remove();
                    $(document).off("mouseup");
                }
            });
        });

    }).off("click", ".table-data-option").on("click", ".table-data-option", function () {
        let $this = $(this);
        getTemplates().then(tpl => {
            $this.parent().append(Mustache.render(tpl.grid_content_card_edit, {
                id: $this.attr("rel"),
                identificador: $this.data("rel"),
                entity: $this.data("entity"),
                editar: $this.data("edit"),
                deletar: $this.data("delete"),
                status: $this.data("status"),
                statusActive: $this.data("statusactive"),
                sync: $this.data("sync")
            }));
            let $cardEdit = $(".grid_content_card_edit");
            $(document).on("mouseup", function(e) {
                if (!$cardEdit.is(e.target) && $cardEdit.has(e.target).length === 0) {
                    $cardEdit.remove();
                    $(document).off("mouseup");
                }
            });
        });

    }).off("click", "#export-file-crud").on("click", "#export-file-crud", function () {
        let grid = grids[$(this).attr("rel")];
        downloadData(grid, !1);

    }).off("click", "#download-file-crud").on("click", "#download-file-crud", function () {
        let grid = grids[$(this).attr("rel")];
        downloadData(grid, !0);

    }).off("change", "#import-file-crud").on("change", "#import-file-crud", function() {
        toast("Enviando Arquivo...", 60000);
        let input = $(this);
        let grid = grids[input.attr("rel")];
        readFile(input.prop('files')[0]).then(d => {
            let upload = [];
            let erros = [];
            d = d.split('\n');
            if (d.length > 1) {
                let base = [];
                $.each(d, function (i, row) {
                    if (!isEmpty(row)) {
                        let registro = {};
                        $.each(row.split(";"), function (ii, col) {
                            if (i === 0) {
                                pushToArrayIndex(base, col.replace(/<:::>/g, ";"), ii);
                            } else {
                                registro[base[ii]] = col.replace(/<:::>/g, ";");
                            }
                        });
                        if (!isEmpty(registro)) {
                            let form = formCrud(grid.entity);
                            form.setData(registro);
                            upload.push(validateDicionario(grid.entity, dicionarios[grid.entity], form, "create").then(() => {
                                if (formNotHaveError(form.error))
                                    return db.exeCreate(grid.entity, form.data); else erros.push(form.error)
                            }))
                        }
                    }
                })
            }
            Promise.all(upload).then(() => {
                grid.reload();
                if (erros.length) {
                    toast(erros.length + " registro" + (erros.length > 1 ? "s" : "") + " não importado devido a erros.", 3500, "toast-warning");
                    console.log(erros)
                } else {
                    toast(upload.length + " registro" + (upload.length > 1 ? "s" : "") + " importado com sucesso", 3500, "toast-success");
                }
            })
        });
    })
});