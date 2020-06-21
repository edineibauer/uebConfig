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
            $filter.find(".table-filter-columns").append("<option value='" + col + "' >" + meta.nome + "</option>")
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