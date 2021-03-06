var syncGridCheck = [];

/**
 * Faz request para ler report
 * @param entity
 * @param search
 * @param filter
 * @param aggroup
 * @param soma
 * @param media
 * @param maior
 * @param menor
 * @param order
 * @param reverse
 * @param limit
 * @param offset
 * @returns {Promise<unknown>}
 */
async function reportRead(entity, search, filter, aggroup, soma, media, maior, menor, order, reverse, limit, offset) {
    order = typeof order === "string" ? order : "id";
    reverse = (typeof reverse !== "undefined" ? (reverse ? !0 : !1) : !1);
    limit = parseInt(typeof limit === "number" ? limit : (localStorage.limitGrid ? localStorage.limitGrid : 15));
    limit = limit < parseInt(localStorage.limitGrid) ? parseInt(localStorage.limitGrid) : limit;
    offset = parseInt(typeof offset === "number" ? offset : 0);

    /**
     * Se tiver mais resultados no back que não estão no front
     * Ou se tiver filtros a serem aplicados
     * Ou se não estiver trabalhando com uma base front
     * então faz a leitura online
     */
    return new Promise(function (resolve, reject) {
        AJAX.post("read/report", {
            entity: entity,
            search: search,
            filter: filter,
            order: order,
            reverse: reverse,
            limit: limit,
            offset: offset,
            aggroup: aggroup,
            soma: soma,
            media: media,
            maior: maior,
            menor: menor
        }).then(data => {
            /**
             * Put data on localstorage
             */
            for(let d of data)
                dbLocal.exeCreate(entity, d);

            resolve(data);
        }).catch(e => {
            console.log(e);
            toast("Houve um erro ao ler Relatório", 2000, "toast-error");
        });
    })
}

function checkToUpdateDbLocal(entity) {
    if (!SERVICEWORKER)
        return Promise.all([]);

    let Reg = new RegExp('^(sync_|__)', 'i');
    if (typeof syncGridCheck[entity] === "undefined" && !Reg.test(entity)) {
        syncGridCheck[entity] = 1;
        return dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            let syncLocal = [];
            if (dadosSync.length) {
                $.each(dadosSync, function (i, e) {
                    syncLocal.push(_moveSyncDataToDb(entity, e, !1));
                });
            }
            return Promise.all(syncLocal);
        })
    }
    return Promise.all([]);
}

async function dbSendData(entity, dados, action) {
    dados.db_action = action;
    if (action === "create")
        dados.id = 0;
    let t = [];
    t.push(dados);
    return new Promise(function (s, f) {
        AJAX.post("up/entity", {entity: entity, dados: convertEmptyArrayToNull(t)}).then(result => {
            s(Object.assign({db_errorback: 0}, result.data[0]));
        }).catch(error => {
            if (typeof navigator.vibrate !== "undefined")
                navigator.vibrate(100);

            if (!isEmpty(form)) {
                showErrorField(form.$element, error.data[0].db_error[form.entity], dicionarios[form.entity], form.entity, 1);
                setFormSaveStatus(form, 1);
            }

            toast("Erro ao cadastrar, corrija o formulário", 7000, "toast-error");

            if (!isEmpty(form))
                f(Object.assign({db_errorback: 1}, error.data[0].db_error[form.entity]));
            else
                f(Object.assign({db_errorback: 1}, error.data[0].db_error));
        })
    });
}

function _filterReport(entity, info, filters, isOrOperator) {
    isOrOperator = typeof isOrOperator !== "undefined" && isOrOperator;

    let grupos = [];
    let filter = [];

    /**
     * Foreach filter, build the struct report
     */
    for (let column in filters) {
        column = column.toString().toLowerCase().trim();
        let searchValor = (!isEmpty(filters[column]) ? (typeof filters[column] === "object" ? filters[column] : filters[column].toString().toLowerCase().trim()) : "");

        /**
         * New group filter
         */
        if ((column === "and" || column === "or" || column === "&&" || column === "||" || (column === "" && typeof searchValor === "object"))) {
            if (typeof searchValor === "object") {
                if (!isEmpty(filter)) {
                    grupos.push({filtros: filter});
                    filter = [];
                }

                for(let g of _filterReport(entity, info, searchValor, (column === "or" || column === "||")))
                    grupos.push(g);
            }

            /**
             * Se a coluna for um corringa, então aplica a busca em todos os campos
             * para isso, isola essa busca em um grupo
             */
        } else {
            let logica = (isOrOperator || /^\|\|/.test(column) ? "or" : "and");
            isOrOperator = !1;
            column = (logica === "or" ? column.replace("||", "") : column);

            if (column === "*" || column === "") {

                if (!isEmpty(filter)) {
                    grupos.push({filtros: filter});
                    filter = [];
                }

                if (!isEmpty(info.columns_readable)) {
                    for (let col of info.columns_readable) {
                        filter.push({
                            logica: (isEmpty(filter) ? logica : "or"),
                            coluna: col,
                            colunas: JSON.stringify([col]),
                            operador: "contém",
                            valor: searchValor.replace(/^%/, "").replace(/%$/, "").trim(),
                            entidades: JSON.stringify([entity])
                        });
                    }
                }

                if (!isEmpty(filter)) {
                    grupos.push({filtros: filter});
                    filter = [];
                }

            } else {

                let entidades = [entity];
                let columnGroup = [column];
                if(/\w+.\w+/.test(column)) {
                    columnGroup = column.split(".");
                    column = columnGroup[columnGroup.length -1];
                    let tempEntity = entity;

                    for(let i in columnGroup) {
                        if(i < columnGroup.length - 1) {
                            entidades.push(dicionarios[tempEntity][columnGroup[i]].relation);
                            tempEntity = dicionarios[tempEntity][columnGroup[i]].relation;
                        }
                    }
                }

                columnGroup = JSON.stringify(columnGroup);
                entidades = JSON.stringify(entidades);

                /**
                 * Se registroValor tiver o valor de searchValor em alguma parte
                 */
                if (/^>/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "maior que",
                        valor: searchValor.replace(/^>/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor tiver o valor de searchValor em alguma parte
                     */
                } else if (/^>=/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "maior igual a",
                        valor: searchValor.replace(/^>=/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor tiver o valor de searchValor em alguma parte
                     */
                } else if (/^</.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "menor que",
                        valor: searchValor.replace(/^</, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor tiver o valor de searchValor em alguma parte
                     */
                } else if (/^<=/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "menor igual a",
                        valor: searchValor.replace(/^<=/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor não tiver o valor de searchValor em alguma parte
                     */
                } else if (/^!%.+%$/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "não contém",
                        valor: searchValor.replace(/^!%/, "").replace(/%$/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor não termina com o mesmo valor que searchValor
                     */
                } else if (/^!%.+/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "não termina com",
                        valor: searchValor.replace(/^!%/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor não começa com o mesmo valor que searchValor
                     */
                } else if (/^!.+%$/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "não começa com",
                        valor: searchValor.replace(/%$/, "").replace(/^!/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor tiver o valor de searchValor em alguma parte
                     */
                } else if (/^%.+%$/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "contém",
                        valor: searchValor.replace(/^%/, "").replace(/%$/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor termina com o mesmo valor que searchValor
                     */
                } else if (/^%.+/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "termina com",
                        valor: searchValor.replace(/^%/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor começa com o mesmo valor que searchValor
                     */
                } else if (/.+%$/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "começa com",
                        valor: searchValor.replace(/%$/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Se registroValor for diferente de searchValor
                     */
                } else if (/^!=*/.test(searchValor)) {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "diferente de",
                        valor: searchValor.replace(/^!=*/, "").trim(),
                        entidades: entidades
                    });

                    /**
                     * Padrão igual a
                     */
                } else {
                    filter.push({
                        logica: logica,
                        coluna: column,
                        colunas: columnGroup,
                        operador: "igual a",
                        valor: searchValor.trim(),
                        entidades: entidades
                    });
                }
            }
        }
    }

    if (!isEmpty(filter))
        grupos.push({filtros: filter});

    return grupos;
}

/**
 * Converte modelo de comparação usado na função CompareString
 * para modelo usado nos filtros de tabela no back-end
 *
 * @param entity
 * @param filter
 * @returns {Promise<[]|*[]>}
 */
async function convertStringToFilter(entity, filters) {
    let info = await dbLocal.exeRead("__info", 1);

    if (isEmpty(filters) || typeof info[entity] === "undefined" || isEmpty(info[entity]))
        return [{tipo: "select", tipoColumn: "", grupos: []}];

    info = info[entity];

    return [{tipo: "select", tipoColumn: "", grupos: _filterReport(entity, info, filters)}];
}

/**
 * Compara o valor de 2 strings,
 * a segunda string pode conter regras de comparação
 *
 * @param registroValor
 * @param searchValor
 * @returns {boolean}
 */
function compareString(registroValor, searchValor) {

    searchValor = !isEmpty(searchValor) ? searchValor.toString().toLowerCase().trim() : "";
    registroValor = !isEmpty(registroValor) ? registroValor.toString().toLowerCase().trim() : "";

    /**
     * Se registroValor tiver o valor de searchValor em alguma parte
     */
    if (/^>/.test(searchValor)) {
        return registroValor > searchValor.replace(/^>/, "").trim();

        /**
         * Se registroValor tiver o valor de searchValor em alguma parte
         */
    } else if (/^>=/.test(searchValor)) {
        return registroValor >= searchValor.replace(/^>=/, "").trim();

        /**
         * Se registroValor tiver o valor de searchValor em alguma parte
         */
    } else if (/^</.test(searchValor)) {
        return registroValor < searchValor.replace(/^</, "").trim();

        /**
         * Se registroValor tiver o valor de searchValor em alguma parte
         */
    } else if (/^<=/.test(searchValor)) {
        return registroValor <= searchValor.replace(/^<=/, "").trim();

        /**
         * Se registroValor não tiver o valor de searchValor em alguma parte
         */
    } else if (/^!%.+%$/.test(searchValor)) {
        return !registroValor.indexOf(searchValor.replace(/^!%/, "").replace(/%$/, "").trim()) > -1;

        /**
         * Se registroValor não termina com o mesmo valor que searchValor
         */
    } else if (/^!%.+/.test(searchValor)) {
        let r = new RegExp(preg_quote(searchValor.replace(/^!%/, "").trim()) + "$", "i");
        return !r.test(registroValor);

        /**
         * Se registroValor não começa com o mesmo valor que searchValor
         */
    } else if (/^!.+%$/.test(searchValor)) {
        let r = new RegExp("^" + preg_quote(searchValor.replace(/%$/, "").replace(/^!/, "").trim()), "i");
        return !r.test(registroValor);

        /**
         * Se registroValor tiver o valor de searchValor em alguma parte
         */
    } else if (/^%.+%$/.test(searchValor)) {
        return registroValor.indexOf(searchValor.replace(/^%/, "").replace(/%$/, "").trim()) > -1;

        /**
         * Se registroValor termina com o mesmo valor que searchValor
         */
    } else if (/^%.+/.test(searchValor)) {
        let r = new RegExp(preg_quote(searchValor.replace(/^%/, "").trim()) + "$", "i");
        return r.test(registroValor);

        /**
         * Se registroValor começa com o mesmo valor que searchValor
         */
    } else if (/.+%$/.test(searchValor)) {
        let r = new RegExp("^" + preg_quote(searchValor.replace(/%$/, "").trim()), "i");
        return r.test(registroValor);

        /**
         * Se registroValor for diferente de searchValor
         */
    } else if (/^!=*/.test(searchValor)) {
        return registroValor != searchValor.replace(/^!=*/, "").trim();
    }

    return registroValor === searchValor;
}

/**
 * Class to read data with filters and options
 */
class Read {
    constructor(entity, id) {
        this.result = [];
        this.total = 0;
        this._clearRead();
        this.setEntity(entity);
        this.setId(id);
    }

    setEntity(entity) {
        if (typeof entity === "string" && entity !== "")
            this.entity = entity;
    }

    setId(id) {
        if (isNumberPositive(id))
            this.id = parseInt(id);
    }

    setFilter(filter) {
        if (typeof filter === "object" && filter !== null && filter.constructor === Object)
            this.filter = filter;
        else if (typeof filter === "string" && filter !== "")
            this.filter = {"*": "%" + filter + "%"};
    }

    setOrderColumn(columnOrder) {
        if (typeof columnOrder === "string" && columnOrder !== "")
            this.columnOrder = columnOrder;
    }

    setOrderReverse() {
        this.orderReverse = !this.orderReverse;
    }

    setLimit(limit) {
        if (isNumberPositive(limit))
            this.limit = parseInt(limit);
    }

    setOffset(offset) {
        if (isNumberPositive(offset))
            this.offset = parseInt(offset);
    }

    getTotal() {
        return this.total;
    }

    getResult() {
        return this.result;
    }

    async exeRead(entity, id, limit, offset, order, orderReverse) {
        this.setEntity(entity);

        if (isNumberPositive(id))
            this.setId(id);
        else
            this.setFilter(id);

        this.setLimit(limit);
        this.setOffset(offset);
        this.setOrderColumn(order);

        if (typeof orderReverse !== "undefined")
            this.setOrderReverse();

        this.result = [];
        this.total = 0;

        if (!this.entity)
            toast("entidade não informada na função de leitura", 3000, "toast-warning");
        else if (typeof dicionarios[this.entity] === "undefined")
            toast("entidade '"+this.entity+"' não existe na função de leitura", 3000, "toast-warning");

        return this._privateExeReadOnline();
    }

    /**
     * Lê registros no back-end
     * @returns {Promise<[]>}
     * @private
     */
    async _privateExeReadOnline() {
        /**
         * Filtra o id, garante que se for um número seja um dado inteiro
         * caso contrário, seta null e ignora o id
         */
        let entity = this.entity;
        let filter = isNumberPositive(this.id) ? {id: parseInt(this.id)} : (!isEmpty(this.filter) ? this.filter : null);
        filter = (await convertStringToFilter(entity, filter));
        let limit = isNumberPositive(this.limit) ? parseInt(this.limit) : null;
        let offset = isNumberPositive(this.offset) ? parseInt(this.offset) : 0;
        let columnOrder = typeof this.columnOrder === "string" && this.columnOrder !== "" ? this.columnOrder : "id";
        let orderReverse = typeof this.orderReverse !== "undefined" && ["desc", "DESC", "1", !0, 1].indexOf(this.orderReverse) > -1;

        /**
         * Create cache for this request
         */
        let querySearch = JSON.stringify(filter) + "-" + columnOrder + "-" + orderReverse +  "-" + limit +  "-" + offset;

        /**
         * Check for cache for this request
         */
        let findCache = !1;
        let cache = await dbLocal.exeRead('_cache_db_' + entity);
        if(!isEmpty(cache)) {
            for(let c of cache) {
                if(c.querySearch === querySearch) {
                    findCache = !0;
                    this.result = c.result;
                    break;
                }
            }
        }

        if(!findCache) {
            this.result = await reportRead(entity, null, filter, null, null, null, null, null, columnOrder, orderReverse, limit, offset);
            dbLocal.exeCreate("_cache_db_" + entity, {querySearch: querySearch, result: this.result});
        }

        let total = await dbLocal.exeRead("__totalRegisters", 1);
        this.total = isNumberPositive(total) ? parseInt(total) : 0;
        this._clearRead();

        return this.result;
    }

    _clearRead() {
        this.entity = "";
        this.id = null;
        this.filter = {};
        this.columnOrder = "id";
        this.orderReverse = !1;
        this.limit = null;
        this.offset = 0;
    }
}

const db = {

    /**
     * @param entity
     * @param idOrObject
     * @param limit
     * @param offset
     * @param order
     * @returns {Promise<*[]|unknown|[]|*>}
     */
    async exeRead(entity, idOrObject, limit, offset, order, orderReverse) {
        let a = new Read;
        return a.exeRead(entity, idOrObject, limit, offset, order, orderReverse);

    }, async exeUpdate(entity, dados, sync) {
        return this.exeCreate(entity, dados, sync);

    }, async exeCreate(entity, dados) {
        if (navigator.onLine) {
            return AJAX.post("exeCreate", {entity: entity, dados: convertEmptyArrayToNull(dados)}).then(d => {
                return {data: d, response: 1};
            }).catch(e => {
                return {data: e, response: 2};
            });

        } else {

            //offline, registra pendência
            dbLocal.exeCreate("_syncDB", {entity: entity, dados: dados});
            return {data: Object.assign(dados, {id: Date.now() + parseInt(Math.random()*100000)}), response: 0};
        }

    }, async exeDelete(entity, id) {
        let ids = [];
        let allDelete = [];

        if (isNumberPositive(id))
            ids.push(id);
        else if (typeof id === "object" && id !== null && id.constructor === Array)
            ids = id;

        if (ids.length) {
            if (SERVICEWORKER) {
                return dbLocal.exeRead("__react").then(react => {
                    for (let k in ids) {
                        if (isNumberPositive(ids[k])) {
                            let idU = parseInt(ids[k]);
                            allDelete.push(_deleteDB(entity, idU, react).then(() => {
                                return dbLocal.exeRead("sync_" + entity, idU).then(d => {
                                    if (isEmpty(d) || d.db_action !== "create") {
                                        return dbLocal.exeCreate("sync_" + entity, {
                                            'id': idU,
                                            'db_action': 'delete'
                                        }).then(id => {
                                            return _dbRemote.syncPost(entity, idU);
                                        });
                                    } else if (d.db_action === "create") {
                                        return dbLocal.exeDelete("sync_" + entity, idU)
                                    }
                                })
                            }))
                        }
                    }
                    return Promise.all(allDelete).then(() => {
                        //atualiza base local, visto que liberou espaço no LIMITOFF
                        return dbLocal.exeRead("__historic", 1).then(h => {
                            h[entity] = null;
                            return dbLocal.exeCreate("__historic", h).then(() => {
                                return _dbRemote.syncDownload(entity);
                            })
                        });
                    })
                })
            } else {
                for (let k in ids) {
                    if (isNumberPositive(ids[k]))
                        allDelete.push(dbSendData(entity, {id: parseInt(ids[k])}, 'delete'));
                }

                return Promise.all(allDelete);
            }
        }
    }
};

const _dbRemote = {
    sync(entity, id, feedback) {
        if (typeof entity === "string") {
            if (!/^(__|sync)/.test(entity)) {
                feedback = typeof feedback === "undefined" ? !1 : ([true, 1, "1", "true"].indexOf(feedback) > -1);
                id = typeof id === "undefined" ? null : id;
                return _dbRemote.syncDownload(entity).then(down => {
                    return _dbRemote.syncPost(entity, id, feedback).then(d => {
                        return down === 0 ? d[0] : 1
                    })
                })
            } else {
                return new Promise((s, f) => {
                    return s([])
                })
            }
        } else if (typeof entity === "undefined") {
            let allReads = [];
            for (let e in dicionarios)
                allReads.push(dbRemote.sync(e));
            return Promise.all(allReads)
        } else if (typeof entity === "object" && entity.constructor === Array) {
            let allReads = [];
            for (let k in entity) {
                allReads.push(dbRemote.sync(entity[k]))
            }
            return Promise.all(allReads)
        }
    }, syncDownload(entity) {
        return dbLocal.exeRead('__historic', 1).then(hist => {
            return new Promise(function (resolve) {
                AJAX.post("load/entity", {entity: entity, historic: (hist[entity] || null)}).then(data => {
                    resolve(data);
                }).catch(() => {});
            }).then(response => {
                if (response === 0)
                    return 0;

                if (response.tipo === 1) {
                    return dbLocal.clear(entity).then(() => {
                        let cc = [];
                        if (response.data.length) {
                            for (let k in response.data.slice(0, parseInt(LIMITOFFLINE))) {
                                if (isNumber(k) && typeof response.data[k] === "object" && typeof response.data[k].id !== "undefined") {
                                    let id = parseInt(response.data[k].id);

                                    if (typeof dicionarios[entity] === "undefined") {
                                        toast("Erro: '" + entity + "' não esta acessível", 5000, "toast-error");
                                        break;
                                    }

                                    for (let col in response.data[k])
                                        response.data[k][col] = _getDefaultValue(dicionarios[entity][col], response.data[k][col]);

                                    response.data[k].id = id;
                                    response.data[k].db_status = !0;
                                    cc.push(dbLocal.exeCreate(entity, response.data[k]));
                                }
                            }
                        }
                        return Promise.all(cc).then(() => {
                            return response;
                        })
                    })
                } else {
                    return _moveSyncDataToDb(entity, response.data).then(() => {
                        return response
                    });
                }
            }).then(response => {
                if (response === 0)
                    return 0;

                //update registros com syncData
                let lastKey = dbLocal.newKey(entity);
                let lastKeySync = dbLocal.newKey("sync_" + entity);
                let sync = dbLocal.exeRead("sync_" + entity);

                return Promise.all([sync, lastKey, lastKeySync]).then(r => {
                    let prom = [];
                    if (!isEmpty(r[0])) {
                        lastKey = r[1] > r[2] ? r[1] : r[2];
                        $.each(r[0], function (i, s) {
                            //depois de criar esse registro, verifica possível conflito com sync ID
                            prom.push(dbLocal.exeRead(entity, parseInt(s.id)).then(e => {
                                if (!isEmpty(e) && e.db_status === !0 && s.db_action === "create") {
                                    let idS = s.id;
                                    s.id = lastKey;
                                    lastKey++;

                                    return db.exeCreate(entity, s, !1).then(syncData => {
                                        if (typeof syncData === "undefined" || syncData === null || syncData.constructor !== Object) {
                                            return dbLocal.exeCreate("error_" + entity, s)
                                        } else {
                                            return dbLocal.exeDelete("sync_" + entity, idS)
                                        }
                                    });

                                } else if (response.tipo === 1) {
                                    _moveSyncDataToDb(entity, s, !1);
                                }
                            }));
                        });
                    }

                    return Promise.all(prom).then(() => {
                        let historicData = {};
                        historicData[entity] = response.historic;
                        dbLocal.exeUpdate("__historic", historicData, 1);

                        return response.historic;
                    });
                })
            })
        })
    }, syncPost(entity, id, feedback) {
        feedback = (typeof feedback === "undefined" ? !1 : ([!0, 1, "1", "true"].indexOf(feedback) > -1));
        id = (typeof id === "undefined" ? null : id);
        let readData = (id ? dbLocal.exeRead('sync_' + entity, id) : dbLocal.exeRead('sync_' + entity));
        return Promise.all([readData]).then(dadosSync => {
            dadosSync = (typeof id === "number" ? dadosSync : dadosSync[0]);
            if (!dadosSync.length)
                return 0;

            return new Promise(function (resolve, reject) {
                if (navigator.onLine) {
                    let promises = [];
                    let total = dadosSync.length;
                    let totalParte = (100 / total);
                    let progress = 0.00;
                    let count = 0;
                    let fail = 0;
                    let failNetwork = !1;
                    let msg = "Registro enviado";
                    if (feedback) {
                        $("#core-upload-progress").addClass("active");
                        toast("<div style='float:left'><div style='float:left'>Enviando</div><div id='core-count-progress' style='float:left'>0</div><div style='float:left'>/" + total + " registros para " + entity + "</div></div>", 1000000, "toast-upload-progress")
                    }
                    $.each(dadosSync, function (i, d) {
                        let dataToSend = [];
                        dataToSend.push(d);
                        let dataReturn = dataToSend;
                        promises.push(new Promise(function (s, f) {
                            AJAX.post("up/entity", {
                                entity: entity,
                                dados: convertEmptyArrayToNull(dataToSend)
                            }).then(result => {
                                let allP = [];
                                if (result.error === 0) {
                                    if (feedback) {
                                        count++;
                                        if ($("#core-count-progress").length)
                                            $("#core-count-progress").html(count); else toast("<div style='float:left'><div style='float:left'>Enviando</div><div id='core-count-progress' style='float:left'>" + count + "</div><div style='float:left'>/" + total + " registros para " + entity + "</div></div>", 1000000, "toast-upload-progress")
                                    }

                                    dataReturn = Object.assign({db_errorback: 0}, result.data[0]);

                                    /**
                                     * Atualização realizada, remove sync desta atualização
                                     * */
                                    if (isNumber(d.id)) {
                                        dbLocal.exeDelete('sync_' + entity, d.id);
                                        dbLocal.exeDelete(entity, d.id);
                                        if (d.db_action !== "delete")
                                            allP.push(_moveSyncDataToDb(entity, result.data[0]));

                                        /**
                                         * Atualiza histórico
                                         * */
                                        let historicData = {};
                                        historicData[entity] = result.historic;
                                        dbLocal.exeUpdate("__historic", historicData, 1)
                                    }

                                } else {
                                    fail++;
                                    if (typeof result.data[0].db_error[entity] === "object")
                                        dataReturn = Object.assign({db_errorback: 1}, result.data[0].db_error[entity]);
                                }

                                if (feedback) {
                                    progress += totalParte;
                                    $("#core-upload-progress-bar").css("width", progress + "%")
                                }

                                Promise.all(allP).then(() => {
                                    s(dataReturn)
                                });
                            }).catch(() => {
                                failNetwork = !0;
                                fail++;
                                s({db_errorback: 1, 0: {"rede": "Falha na Comunicação"}});
                            });
                        }))
                    });
                    Promise.all(promises).then(p => {
                        if (feedback) {
                            if (total === 1) {
                                if (p[0].db_errorback === 1) {
                                    delete p[0].db_errorback;
                                    msg = Object.keys(p[0])[0] + ": " + Object.values(p[0])[0];
                                }

                            } else {
                                if (fail === 0) {
                                    msg = "Todos os registros enviados"
                                } else {
                                    msg = "Erro ao enviar: " + fail + " de " + total;
                                }
                            }

                            toast(msg, 4000, (fail > 0 ? "toast-error" : "toast-success") + " toast-upload-progress");
                            $("#core-upload-progress").removeClass("active");
                            setTimeout(function () {
                                $("#core-upload-progress-bar").css("width", 0)
                            }, 600)
                        }
                        resolve(p);
                    })
                } else {
                    resolve([Object.assign({db_errorback: 0}, dadosSync[0])]);
                }
            })
        })
    }
};

const dbLocal = {
    conn(entity) {
        return idb.open(entity, 1, upgradeDB => {
                upgradeDB.createObjectStore(entity)
            });
    }, async exeRead(entity, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            if (isNumberPositive(key)) {
                return dbLocalTmp.transaction(entity).objectStore(entity).get(parseInt(key)).then(v => {
                    return (typeof v !== "undefined" ? v : {})
                }).catch(() => {
                });
            } else {
                return checkToUpdateDbLocal(entity).then(() => {
                    return dbLocalTmp.transaction(entity).objectStore(entity).getAll().then(v => {
                        return (typeof v !== "undefined" ? v : {})
                    }).catch(err => {
                        navigator.webkitTemporaryStorage.queryUsageAndQuota((usedBytes, grantedBytes) => {
                            toast((err.message === "Maximum IPC message size exceeded." ? "Isso pode demorar, carregando " + (usedBytes / 1000000).toFixed(0) + " MB" : err.messsage), 4000, "toast-warning");
                        });

                        let data = [];
                        const tx = dbLocalTmp.transaction(entity);
                        const store = tx.objectStore(entity);
                        (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                            if (!cursor)
                                return;

                            data.push(
                                store.get(cursor.key).then(v => {
                                    return (typeof v !== "undefined" ? v : {})
                                }).catch(c => {
                                    return {};
                                })
                            );

                            cursor.continue()
                        });

                        return tx.complete.then(() => {
                            return Promise.all(data).then(d => {
                                return d;
                            })
                        });
                    });
                });
            }
        })
    }, async exeCreate(entity, val) {
        val.id = (/^__/.test(entity) ? 1 : (isNumberPositive(val.id) ? parseInt(val.id) : 0));

        if (val.id > 0) {
            let id = val.id;
            if (/^__/.test(entity))
                delete val.id;

            return dbLocal.insert(entity, val, id)
        } else {
            delete val.id;
            return dbLocal.newKey(entity).then(key => {
                return dbLocal.insert(entity, val, key)
            })
        }
    }, async exeDelete(entity, key) {
        if (!isNumberPositive(key))
            return new Promise.all([]);

        return dbLocal.conn(entity).then(dbLocalTmp => {
            const tx = dbLocalTmp.transaction(entity, 'readwrite');
            tx.objectStore(entity).delete(parseInt(key));
            return tx.complete
        })
    }, async exeUpdate(entity, dados, key) {
        if (!isNumberPositive(key))
            return new Promise.all([]);

        key = parseInt(key);
        return dbLocal.exeRead(entity, key).then(data => {
            for (let name in dados)
                data[name] = dados[name];
            data.id = key;
            return this.exeCreate(entity, data);
        })
    }, async insert(entity, val, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            const tx = dbLocalTmp.transaction(entity, 'readwrite');
            tx.objectStore(entity).put(val, key);
            return key
        })
    }, newKey(entity) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            return dbLocalTmp.transaction(entity).objectStore(entity).getAllKeys()
        }).then(e => {
            return e.length > 0 ? (e.pop() + 1) : 1
        })
    }, clear(entity) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            const tx = dbLocalTmp.transaction(entity, 'readwrite');
            tx.objectStore(entity).clear();
            return tx.complete
        })
    }, async keys(entity) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            const tx = dbLocalTmp.transaction(entity);
            let keys = [];
            const store = tx.objectStore(entity);
            (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                if (!cursor) return;
                keys.push(cursor.key);
                cursor.continue()
            });
            return tx.complete.then(() => keys)
        })
    }
};

function _getIdAction(entity, id) {
    if (isNaN(id) || id < 1) {
        let keyReg = dbLocal.newKey(entity);
        let keySync = dbLocal.newKey("sync_" + entity);
        return Promise.all([keyReg, keySync]).then(r => {
            return [(r[0] > r[1] ? r[0] : r[1]), 'create']
        })
    } else {
        return dbLocal.exeRead("sync_" + entity, id).then(d => {
            if (isEmpty(d)) {
                return db.exeRead(entity, id).then(d => {
                    return [parseInt(id), (isEmpty(d) ? 'create' : 'update')]
                })
            } else {
                return [parseInt(id), (d.db_action === 'update' ? 'update' : 'create')];
            }
        })
    }
}

function _moveSyncDataToDb(entity, dados, db_status) {
    db_status = typeof db_status === "undefined" ? !0 : db_status;
    if (typeof dados === "object" && dados.constructor === Object) {
        let dd = dados;
        dados = [];
        dados.push(dd)
    }
    if (typeof dados === "undefined" || dados.constructor !== Array || !dados.length) {
        return new Promise((r, f) => {
            return r([])
        })
    }
    let movedAsync = [];
    $.each(dados, function (i, dado) {
        let d = Object.assign({}, dado);
        // let idOld = parseInt(d.id_old);
        let ac = d.db_action;
        delete (d.db_action);
        delete (d.id_old);
        if (d.constructor === Object && !isEmpty(d) && isNumber(d.id)) {
            switch (ac) {
                case 'create':
                case 'update':
                    let id = parseInt(d.id);
                    for (let col in d)
                        d[col] = _getDefaultValue(dicionarios[entity][col], d[col]);
                    d.id = id;
                    d.db_status = db_status;
                    // if (!isEmpty(d.ownerpub) && parseInt(d.ownerpub) !== parseInt(USER.id)) {
                    //     movedAsync.push(dbLocal.exeDelete(entity, d.id))
                    // } else {
                    movedAsync.push(dbLocal.exeCreate(entity, d))
                    // }
                    break;
                case 'delete':
                    if (isNumberPositive(d.id))
                        movedAsync.push(dbLocal.exeDelete(entity, d.id));
                    break
            }
        }
    });
    return Promise.all(movedAsync).then(() => {
        return dados
    })
}

function _deleteDB(entity, id, react) {
    return dbLocal.exeDelete(entity, id).then(() => {
        if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity]["delete"] !== "undefined")
            eval(react[0][entity]["delete"]);
    })
}

function _getDefaultValues(entity, values) {
    let valores = {};
    $.each(dicionarios[entity], function (column, meta) {
        let value = (typeof values !== "undefined" && typeof values[meta.column] !== "undefined" ? values[meta.column] : meta.default)
        valores[column] = _getDefaultValue(meta, value)
    });

    if (typeof values !== "undefined" && isNumber(values.id))
        valores.id = parseInt(values.id);

    return valores
}

function _getDefaultValue(meta, value) {
    let valor = "";
    if (typeof meta === "object" && meta !== null) {
        let jsonStringWrongValidation = new RegExp("^\\[\\s*\\w+\\s*(,\\s*\\w+\\s*)*\\]$", "i");
        if (meta.type === "json" && typeof value === "string" && isNaN(value) && !isJson(value) && jsonStringWrongValidation.test(value)) {
            let testValue = value.replace("[", '["').replace(']', '"]').split(",").join('", "');
            if (isJson(testValue)) {
                testValue = JSON.parse(testValue);
                if (testValue.constructor === Array && testValue.length > 0)
                    value = testValue.map(s => s.toString().trim());
            }
        }

        if ((['boolean', 'status'].indexOf(meta.format) === -1 && value === !1) || value === null)
            value = "";
        else if (meta.type === "json")
            value = typeof value === "object" ? value : (isJson(value) ? JSON.parse(value) : (isNumber(value) ? JSON.parse("[" + value + "]") : ""));
        else if (meta.group === "date")
            value = value.replace(" ", "T");

        if (typeof value === "object" && value.constructor === Array) {
            if (meta.key === "relation") {
                $.each(value, function (i, e) {
                    if (typeof e.columnTituloExtend !== "string") {
                        value[i].id = Date.now();
                        value[i].columnTituloExtend = "";
                        getRelevantTitle(meta.relation, value[i]).then(title => {
                            value[i].columnTituloExtend = title;
                        });
                        value[i].columnName = meta.column;
                        value[i].columnRelation = meta.relation;
                        value[i].columnStatus = {column: '', have: !1, value: !1}
                    }
                });

            } else if (meta.key === "source") {
                let reg = new RegExp("^image", "i");
                $.each(value, function (i, e) {
                    if (typeof e.isImage === "undefined")
                        value[i].isImage = reg.test(e.fileType);
                })
            }
        }

        switch (meta.format) {
            case 'boolean':
            case 'status':
                valor = value === !0 || value === 1 || value === "1" || value === "true" ? 1 : 0;
                break;
            case 'publisher':
            case 'number':
            case 'year':
                valor = isNumberPositive(value) ? parseInt(value) : null;
                break;
            case 'percent':
                valor = value !== "" ? value.toString().replace(',', '').replace('.', '').replace('%', '') : null;
                break;
            case 'valor_decimal_none':
                if (typeof value === "number")
                    value = value.toString();

                if (typeof value !== "string") {
                    valor = 0;
                    break;
                }

                value = replaceAll(replaceAll(value, ".", ""), ",", "");

                valor = (isNumber(value) ? parseInt(value) : null);
                break;
            case 'valor':
            case 'valor_decimal':
            case 'valor_decimal_plus':
            case 'valor_decimal_minus':
                if (typeof value === "number")
                    value = value.toString();

                if (typeof value !== "string") {
                    valor = 0;
                    break;
                }

                if (value.split(",").length > 1)
                    value = replaceAll(value, ".", "").replace(",", ".");

                let decimal = (meta.format === 'valor' ? 2 : (meta.format === 'valor_decimal' ? 3 : (meta.format === 'valor_decimal_plus' ? 4 : 1)));
                valor = (isNumber(value) ? parseFloat(value).toFixed(decimal) : null);
                break;
            case 'float':
                value = (typeof value === "string" ? value.replace(',', '.') : value);
                valor = isNumber(value) ? parseFloat(value) : null;
                break;
            case 'date':
                if (['date', 'now', 'agora', 'data', 'hoje'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = dataAgora.getFullYear() + "-" + zeroEsquerda(dataAgora.getMonth() + 1) + "-" + zeroEsquerda(dataAgora.getDate())
                } else {
                    valor = value !== "" ? value : null
                }

                //00.000
                break;
            case 'datetime':
                if (['date', 'now', 'agora', 'data', 'hoje', 'datetime'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = dataAgora.getFullYear() + "-" + zeroEsquerda(dataAgora.getMonth() + 1) + "-" + zeroEsquerda(dataAgora.getDate()) + "T" + zeroEsquerda(dataAgora.getHours()) + ":" + zeroEsquerda(dataAgora.getMinutes())
                } else {
                    valor = value !== "" ? value.replace(".000", "") : null;
                }
                break;
            case 'time':
                if (['date', 'now', 'agora', 'data', 'hoje', 'time'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = zeroEsquerda(dataAgora.getHours()) + ":" + zeroEsquerda(dataAgora.getMinutes())
                } else {
                    valor = value !== "" ? value.replace(".000", "") : null;
                }
                break;
            case 'checkbox':
                let options = [];
                valor = [];
                $.each(meta.allow.options, function (i, e) {
                    options.push(e.valor.toString())
                });
                if (value !== "") {
                    if (isJson(value)) {
                        let jsondata = $.parseJSON(value);
                        if ($.isArray(jsondata)) {
                            $.each(jsondata, function (i, e) {
                                if (options.indexOf(e.toString()) > -1)
                                    valor.push(e.toString())
                            })
                        } else {
                            if (typeof jsondata !== "undefined" && jsondata !== null && jsondata !== "" && options.indexOf(jsondata.toString()) > -1)
                                valor.push(jsondata.toString())
                        }
                    } else if ($.isArray(value)) {
                        $.each(value, function (i, e) {
                            if (typeof e !== "undefined" && value !== null && e !== "" && options.indexOf(e.toString()) > -1)
                                valor.push(e.toString())
                        })
                    } else {
                        if (typeof value !== "undefined" && value !== null && e !== "" && options.indexOf(value.toString()) > -1)
                            valor.push(value.toString())
                    }
                }
                break;
            case 'source':
                if (!$.isArray(value)) {
                    valor = [];
                    if (value !== "")
                        valor.push(value)
                } else {
                    valor = value
                }
                break;
            case 'extend':
                valor = value !== "" ? _getDefaultValues(meta.relation, value) : _getDefaultValues(meta.relation);
                break;
            default:
                valor = value !== "" ? (value === 0 ? "0" : value) : null
        }
    } else {
        valor = null
    }
    return valor
}

function _syncDataBtn(entity) {
    $(".toast, .btn-panel-sync").remove();

    if (navigator.onLine) {
        $(".btn-sync-all").remove();
        _dbRemote.sync(entity, null, !0).then(() => {
            for (let i in grids) {
                if (typeof grids[i] === "object" && (typeof entity === "undefined" || grids[i].entity === entity)) {
                    grids[i].reload();
                    break;
                }
            }
        });
    }
}