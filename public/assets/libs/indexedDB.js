var syncGridCheck = [];

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
                    syncLocal.push(moveSyncDataToDb(entity, e, !1));
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

async function exeReadOnline(entity, id) {
    id = isNumberPositive(id) ? id : null;
    let history = await dbLocal.exeRead("__historic", 1);
    let result = await AJAX.post("load/entity", {entity: entity, id: id, historic: history[entity]});
    if (!isEmpty(result) && !isEmpty(result.data)) {
        if (id)
            return getDefaultValues(entity, result.data[0]);

        let results = [];
        for(let e of result.data)
            results.push(getDefaultValues(entity, e));

        return results;
    }

    return id ? {} : [];
}

/**
 * Converte modelo de comparação usado na função CompareString
 * para modelo usado nos filtros de tabela no back-end
 *
 * @param search
 * @returns {[]}
 */
function convertCompareStringToFilter(search) {

    let filter = [];
    /**
     * Para cada filtro, aplica em cima de cada registro
     */
    for (let column in search) {
        /**
         * Se a coluna for um corringa, então aplica em cima de todas as colunas do registro
         */
        if (column === "*") {
            filter.push({operator: "por", column: column.replace(/^\d+/, ""), value: search[column]});
        } else {

            let searchValor = !isEmpty(search[column]) ? search[column].toString().toLowerCase().trim() : "";

            /**
             * Se registroValor tiver o valor de searchValor em alguma parte
             */
            if (/^>/.test(searchValor)) {
                filter.push({
                    operator: "maior que",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^>/, "").trim()
                });

                /**
                 * Se registroValor tiver o valor de searchValor em alguma parte
                 */
            } else if (/^>=/.test(searchValor)) {
                filter.push({
                    operator: "maior igual a",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^>=/, "").trim()
                });

                /**
                 * Se registroValor tiver o valor de searchValor em alguma parte
                 */
            } else if (/^</.test(searchValor)) {
                filter.push({
                    operator: "menor que",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^</, "").trim()
                });

                /**
                 * Se registroValor tiver o valor de searchValor em alguma parte
                 */
            } else if (/^<=/.test(searchValor)) {
                filter.push({
                    operator: "menor igual a",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^<=/, "").trim()
                });

                /**
                 * Se registroValor não tiver o valor de searchValor em alguma parte
                 */
            } else if (/^!%.+%$/.test(searchValor)) {
                filter.push({
                    operator: "não contém",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^!%/, "").replace(/%$/, "").trim()
                });

                /**
                 * Se registroValor não termina com o mesmo valor que searchValor
                 */
            } else if (/^!%.+/.test(searchValor)) {
                filter.push({
                    operator: "não termina com",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^!%/, "").trim()
                });

                /**
                 * Se registroValor não começa com o mesmo valor que searchValor
                 */
            } else if (/^!.+%$/.test(searchValor)) {
                filter.push({
                    operator: "não começa com",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/%$/, "").replace(/^!/, "").trim()
                });

                /**
                 * Se registroValor tiver o valor de searchValor em alguma parte
                 */
            } else if (/^%.+%$/.test(searchValor)) {
                filter.push({
                    operator: "contém",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^%/, "").replace(/%$/, "").trim()
                });

                /**
                 * Se registroValor termina com o mesmo valor que searchValor
                 */
            } else if (/^%.+/.test(searchValor)) {
                filter.push({
                    operator: "termina com",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^%/, "").trim()
                });

                /**
                 * Se registroValor começa com o mesmo valor que searchValor
                 */
            } else if (/.+%$/.test(searchValor)) {
                filter.push({
                    operator: "começa com",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/%$/, "").trim()
                });

                /**
                 * Se registroValor for diferente de searchValor
                 */
            } else if (/^!=*/.test(searchValor)) {
                filter.push({
                    operator: "diferente de",
                    column: column.replace(/^\d+/, ""),
                    value: searchValor.replace(/^!=*/, "").trim()
                });

                /**
                 * Padrão igual a
                 */
            } else {
                filter.push({operator: "igual a", column: column.replace(/^\d+/, ""), value: searchValor.trim()});
            }
        }
    }

    return filter;
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
 * Class to update data
 */
class Update {
    constructor(entity, data) {
        this.entity = "";
        this.data = null;

        this.setEntity(entity);
        this.setData(data);
    }

    setEntity(entity) {
        if (typeof entity === "string" && entity !== "")
            this.entity = entity;
    }

    setData(data) {
        if (!isEmpty(data) && data.constructor === Object)
            this.data = data;
    }

    async exeUpdate(entity, dados) {
        this.setEntity(entity);
        this.setData(dados);

        if (isNumberPositive(this.data.id)) {

            /**
             * If no using SERVICEWORKER, so send to the back
             */
            if (!SERVICEWORKER)
                return dbSendData(this.entity, this.data, "update");

            /**
             * Get the id to the new data
             * and set status sync false
             */
            this.data.id = (await getIdAction(this.entity, this.data.id))[0];
            this.data.db_status = !1;

            /**
             * exeCreate local
             */
            let dadosCreated = await dbLocal.exeCreate(this.entity, this.data);

            /**
             * Create the sync request local
             */
            this.data.db_action = "update";
            let syncCreated = await dbLocal.insert("sync_" + this.entity, this.data, this.data.id);

            /**
             * Exe Sync local with back
             */
            let syncReturn = await dbRemote.syncPost(this.entity, this.data.id);

            /**
             * If have erro on back, remove the data on local
             */
            if (syncReturn[0].db_errorback !== 0) {
                await dbLocal.exeDelete(this.entity, dadosCreated);
                await dbLocal.exeDelete("sync_" + this.entity, syncCreated);
            }

            /**
             * Set the data returned from the back to the result function
             */
            this.data = syncReturn[0];

            /**
             * Check if have some react offline action to execute with the success on create new data
             */
            let react = await dbLocal.exeRead("__react");
            if (this.data.db_errorback === 0 && typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][this.entity] !== "undefined" && typeof react[0][this.entity]["update"] !== "undefined")
                eval(react[0][this.entity][action]);

            /**
             * return the data
             */
            return this.data;

        } else {
            toast("id não informado para atualização", 2000, "toast-warning");
        }
    }
}

/**
 * Class to create new data
 */
class Create {
    constructor(entity, data) {
        this.entity = "";
        this.data = null;

        this.setEntity(entity);
        this.setData(data);
    }

    setEntity(entity) {
        if (typeof entity === "string" && entity !== "")
            this.entity = entity;
    }

    setData(data) {
        if (!isEmpty(data) && data.constructor === Object)
            this.data = data;
    }

    async exeCreate(entity, dados) {
        this.setEntity(entity);
        this.setData(dados);

        /**
         * If no using SERVICEWORKER, so send to the back
         */
        if (!SERVICEWORKER)
            return dbSendData(this.entity, this.data, (typeof this.data.id === "undefined" || !isNumberPositive(this.data.id) ? "create" : "update"));

        /**
         * If have id on data, so send to the update class
         */
        if (typeof this.data.id !== "undefined" && isNumberPositive(this.data.id)) {
            let update = new Update();
            return update.exeUpdate(this.entity, this.data);
        }

        /**
         * Get the id to the new data
         * and set status sync false
         */
        this.data.id = (await getIdAction(this.entity, this.data.id))[0];
        this.data.db_status = !1;

        /**
         * exeCreate local
         */
        let dadosCreated = await dbLocal.exeCreate(this.entity, this.data);

        /**
         * Create the sync request local
         */
        this.data.db_action = "create";
        let syncCreated = await dbLocal.insert("sync_" + this.entity, this.data, this.data.id);

        /**
         * Exe Sync local with back
         */
        let syncReturn = await dbRemote.syncPost(this.entity, this.data.id);

        /**
         * If have erro on back, remove the data on local
         */
        if (syncReturn[0].db_errorback !== 0) {
            await dbLocal.exeDelete(this.entity, dadosCreated);
            await dbLocal.exeDelete("sync_" + this.entity, syncCreated);
        }

        /**
         * Set the data returned from the back to the result function
         */
        this.data = syncReturn[0];

        /**
         * Check if have some react offline action to execute with the success on create new data
         */
        let react = await dbLocal.exeRead("__react");
        if (this.data.db_errorback === 0 && typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][this.entity] !== "undefined" && typeof react[0][this.entity]["create"] !== "undefined")
            eval(react[0][this.entity][action]);

        /**
         * return the data
         */
        return this.data;
    }
}

/**
 * Class to delete data
 */
class Delete {
    constructor(entity, id) {
        this.entity = "";
        this.id = null;

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

    async exeDelete(entity, id) {
        let ids = [];
        if (!SERVICEWORKER) {
            for (let e of id)
                ids.push(await dbSendData(entity, {id: parseInt(e)}, 'delete'));

            return ids;
        }

        let react = await dbLocal.exeRead("__react");
        let allDelete = [];

        //if id is number or array
        if (isNumberPositive(id))
            ids.push(id);
        else if (typeof id === "object" && id !== null && id.constructor === Array)
            ids = id;

        if (ids.length) {
            for (let k in ids) {
                if (isNumberPositive(ids[k])) {
                    let idU = parseInt(ids[k]);

                    allDelete.push(deleteDB(entity, idU, react).then(() => {
                        return dbLocal.exeRead("sync_" + entity, idU).then(d => {
                            if (isEmpty(d) || d.db_action === "update") {
                                return dbLocal.exeCreate("sync_" + entity, {
                                    'id': idU,
                                    'db_action': 'delete'
                                }).then(id => {
                                    return dbRemote.syncPost(entity, idU);
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
                        return dbRemote.syncDownload(entity);
                    })
                });
            })
        }
    }
}

/**
 * Class to read data with filters and options
 */
class Read {
    constructor(entity, id) {
        this.result = [];
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

    async exeRead(entity, id, limit, offset, order) {
        this.setEntity(entity);

        if(isNumberPositive(id))
            this.setId(id);
        else
            this.setFilter(id);

        this.setLimit(limit);
        this.setOffset(offset);
        this.setOrderColumn(order);

        this.result = [];
        this.total = 0;

        if (!this.entity)
            toast("entidade não informada na função de leitura", 3000, "toast-warning");
        else if (typeof dicionarios[this.entity] === "undefined")
            toast("entidade não existe na função de leitura", 3000, "toast-warning");

        /**
         * Se o navegador estiver sem conexão com a internet, ou
         * se a leitura for em uma tabela de sincronização ou se
         * for em uma tabela de controle de dados,
         * então lê somente os registros locais do navegador.
         */
        if (!navigator.onLine || /^(sync_|__)/.test(this.entity))
            return this._privateArrayFilterData(await dbLocal.exeRead(this.entity, this.id));

        /**
         * Caso não esteja trabalhando com dados locais indexedDB
         * então realiza a leitura dos dados online
         */
        if (!SERVICEWORKER)
            return this._privateExeReadOnline(this.entity, this.id, this.filter, this.columnOrder, this.orderReverse, this.limit, this.offset);

        /**
         * Primeiro, baixa os dados da entidade, caso não tenha feito isso ainda,
         * atualizando a base local com os registros do back-end
         */
        // await dbRemote.syncDownload(this.entity);

        /**
         * Primeiro tenta verificar se uma busca local é suficiente
         */
        this.result = await dbLocal.exeRead(this.entity, this.id);
        this.total = this.result.length;

        /**
         * Se estiver procurando um ID em específico
         * Caso tenha encontrado o registro específico na base local
         * então retorna, senão busca no no back-end
         */
        if (this.id) {
            if(!isEmpty(this.result)) {
                this._clearRead();
                return this.result;
            } else {
                return this._privateExeReadOnline(this.entity, this.id, this.filter, this.columnOrder, this.orderReverse, this.limit, this.offset);
            }
        }

        /**
         * Se tiver um limit de registros estabelecido então verifica
         * se o número de registros retorna é menor que o limit, retorna os registros
         * se o limit for maior que o LIMITOFFLINE, então lê registros online
         * se o limit for maior, então retorna somente a quantidade desejada
         */
        let maxOffline = LIMITOFFLINE + (await dbLocal.keys("sync_" + this.entity)).length;
        if (this.limit)
            return (this.total < maxOffline ? this._privateArrayFilterData(this.result) : this._privateExeReadOnline(this.entity, this.id, this.filter, this.columnOrder, this.orderReverse, this.limit, this.offset));

        /**
         * Caso não tenha determinado um limit para minha consulta
         * e a lista de registros retornadas é igual ao meu limite de
         * registros offline, então busca online para verificar se
         * existe mais registros no back-end que não estão no front-end
         */
        if (this.total === maxOffline)
            return this._privateExeReadOnline(this.entity, this.id, this.filter, this.columnOrder, this.orderReverse, this.limit, this.offset);

        /**
         * Retorna leitura local caso não tenha limit estabelecido e o número de registros não seja o máximo
         */
        return this._privateArrayFilterData(this.result);
    }

    /**
     * Aplica filtros e regras a uma lista de registros
     * retorna registros que passaram nas regras
     *
     * @param data
     * @returns {*[]}
     * @private
     */
    _privateArrayFilterData(data) {

        if (typeof data !== "object" || data === null || data.constructor !== Array || data.length === 0)
            return [];

        let retorno = [];

        /**
         * Se tiver um filtro para ser aplicado nos registros
         */
        if (!isEmpty(this.filter)) {

            /**
             * Para cada registro, verifica se passa nos testes
             * caso passe, adiciona na lista de retorno
             */
            for (let reg of data) {
                let passou = !0;

                /**
                 * Para cada filtro, aplica em cima de cada registro
                 */
                for (let column in this.filter) {
                    /**
                     * Se a coluna for um corringa, então aplica em cima de todas as colunas do registro
                     */
                    if (column === "*") {

                        /**
                         * Para cada coluna de um registro
                         */
                        for (let col in reg) {
                            if (typeof reg[col] === "string" && reg[col] !== "" && col !== 'ownerpub' && col !== 'autorpub' && col !== 'system_id' && col !== 'id') {
                                passou = compareString(reg[col], this.filter[column]);
                                if (passou)
                                    break;
                            }
                        }
                    } else {
                        passou = compareString(reg[column.replace(/^\d+/, "")], this.filter[column]);
                    }

                    /**
                     * Se não passou, então já cancela os outros filtros
                     */
                    if (!passou)
                        break;
                }

                /**
                 * Se o registro passou pelos filtros, então adiciona a lista de retorno
                 */
                if (passou)
                    retorno.push(getDefaultValues(this.entity, reg));
            }
        } else {
            retorno = data;
        }

        /**
         * Ordena
         */
        retorno = orderBy(retorno, this.columnOrder);

        /**
         * Ordenação reversa, padrão reverte
         */
        if (!this.orderReverse)
            retorno = retorno.reverse();

        /**
         * Obtém o total de resultados
         * @type {number}
         */
        this.total = retorno.length;

        /**
         * Limit offset
         */
        if (this.limit)
            retorno = retorno.slice(this.offset, (this.offset + this.limit));

        this._clearRead();

        return this.result = retorno;
    }

    /**
     * Lê registros no back-end
     * @param entity
     * @param id
     * @param search
     * @param columnOrder
     * @param orderReverse
     * @param limit
     * @param offset
     * @returns {Promise<unknown>}
     * @private
     */
    async _privateExeReadOnline(entity, id, search, columnOrder, orderReverse, limit, offset) {
        /**
         * Filtra o id, garante que se for um número seja um dado inteiro
         * caso contrário, seta null e ignora o id
         */
        id = isNumberPositive(id) ? parseInt(id) : null;
        limit = isNumberPositive(limit) ? parseInt(limit) : null;
        offset = isNumberPositive(offset) ? parseInt(offset) : 0;
        columnOrder = typeof columnOrder === "string" && columnOrder !== "" ? columnOrder : "id";
        orderReverse = typeof orderReverse !== "undefined" && ["desc", "DESC", "1", !0, 1].indexOf(orderReverse) > -1;
        search = !isEmpty(search) ? convertCompareStringToFilter(search) : null;

        return new Promise(function (r) {
            AJAX.post("load/entity", {
                entity: entity,
                id: id,
                filter: search,
                order: columnOrder,
                reverse: orderReverse,
                limit: limit,
                offset: offset,
                historic: null
            }).then(result => {
                if (!isEmpty(result))
                    r(result);

                r({data: [], total: 0});
            }).catch(() => {
                r({result: id ? {} : [], total: 0});
            });
        }).then(results => {
            if (id) {
                this.result = getDefaultValues(entity, results.data[0]);
                this.total = 1;
                this._clearRead();
                return this.result;
            }

            this.result = [];
            this.total = results.total;

            return dbLocal.exeRead("sync_" + entity).then(syncs => {
                if (!isEmpty(syncs)) {
                    this.total += syncs.length;
                    for (let s of syncs.reverse())
                        this.result.push(Object.assign({db_status: !1}, getDefaultValues(entity, s)));
                }

                for (let e of results.data)
                    this.result.push(getDefaultValues(entity, e));

                this._clearRead();

                return this.result;
            });
        })
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

const read = new Read;

const db = {
    async exeRead(entity, key) {
        let Reg = new RegExp('^(sync_|__)', 'i');
        if (Reg.test(entity)) {
            toast("[Erro de programação] não é possível LER registros Sync Online. " + entity, 5000, "toast-error");
            return;
        }

        key = isNumberPositive(key) ? parseInt(key) : null;

        if (!navigator.onLine)
            return dbLocal.exeRead(entity, key);

        if (!SERVICEWORKER)
            return exeReadOnline(entity, key);

        return dbRemote.syncDownload(entity).then(() => {
            return dbLocal.exeRead(entity, key).then(r => {
                if (!isEmpty(r))
                    return r;

                if (key)
                    return exeReadOnline(entity, key);

                return [];
            })
        });

    }, async exeCreate(entity, dados, sync) {
        if (SERVICEWORKER) {
            sync = typeof sync === "undefined" ? !0 : sync;
            dados.id = isNumberPositive(dados.id) ? parseInt(dados.id) : 0;
            let idAction = getIdAction(entity, dados.id);
            let react = dbLocal.exeRead("__react");
            return Promise.all([idAction, react]).then(r => {
                dados.id = r[0][0];
                dados.db_status = !1;
                let action = r[0][1];
                react = r[1];
                return dbLocal.exeCreate(entity, dados).then(dadosCreated => {
                    dados.db_action = action;
                    return dbLocal.insert("sync_" + entity, dados, dados.id).then(syncCreated => {
                        if (sync) {
                            return dbRemote.syncPost(entity, dados.id).then(syncReturn => {

                                /**
                                 * Se tiver algum erro no back e for um novo registro, desfaz excluindo o registro recém criado.
                                 */
                                if (syncReturn[0].db_errorback !== 0 && action === "create") {
                                    dbLocal.exeDelete(entity, dadosCreated);
                                    dbLocal.exeDelete("sync_" + entity, syncCreated);
                                }

                                return syncReturn;
                            });
                        }

                        return [Object.assign({db_errorback: 0}, dados)];
                    });
                }).then(dados => {
                    dados = dados[0];
                    if (dados.db_errorback === 0 && typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                        eval(react[0][entity][action]);

                    return dados;
                });
            })
        } else {
            return dbSendData(entity, dados, (typeof dados.id === "undefined" || isNaN(dados.id) || dados.id < 1 ? "create" : "update"));
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
                            allDelete.push(deleteDB(entity, idU, react).then(() => {
                                return dbLocal.exeRead("sync_" + entity, idU).then(d => {
                                    if (isEmpty(d) || d.db_action === "update") {
                                        return dbLocal.exeCreate("sync_" + entity, {
                                            'id': idU,
                                            'db_action': 'delete'
                                        }).then(id => {
                                            return dbRemote.syncPost(entity, idU);
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
                                return dbRemote.syncDownload(entity);
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
const dbRemote = {
    sync(entity, id, feedback) {
        if (typeof entity === "string") {
            if (!/^(__|sync)/.test(entity)) {
                feedback = typeof feedback === "undefined" ? !1 : ([true, 1, "1", "true"].indexOf(feedback) > -1);
                id = typeof id === "undefined" ? null : id;
                return dbRemote.syncDownload(entity).then(down => {
                    return dbRemote.syncPost(entity, id, feedback).then(d => {
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
            for (var e in dicionarios)
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
                });
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
                                        response.data[k][col] = getDefaultValue(dicionarios[entity][col], response.data[k][col]);

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
                    return moveSyncDataToDb(entity, response.data).then(() => {
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
                                    moveSyncDataToDb(entity, s, !1);
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
                                            allP.push(moveSyncDataToDb(entity, result.data[0]));

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

var conn = {};
const dbLocal = {
    conn(entity) {
        if (typeof conn[entity] === "undefined") {
            conn[entity] = idb.open(entity, 1, upgradeDB => {
                upgradeDB.createObjectStore(entity)
            })
        }
        return conn[entity]
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

function getIdAction(entity, id) {
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

function moveSyncDataToDb(entity, dados, db_status) {
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
                        d[col] = getDefaultValue(dicionarios[entity][col], d[col]);
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

function deleteDB(entity, id, react) {
    return dbLocal.exeDelete(entity, id).then(() => {
        if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity]["delete"] !== "undefined")
            eval(react[0][entity]["delete"]);
    })
}

function getDefaultValues(entity, values) {
    let valores = {};
    $.each(dicionarios[entity], function (column, meta) {
        let value = (typeof values !== "undefined" && typeof values[meta.column] !== "undefined" ? values[meta.column] : meta.default)
        valores[column] = getDefaultValue(meta, value)
    });

    if (typeof values !== "undefined" && isNumber(values.id))
        valores.id = parseInt(values.id);

    return valores
}

function getDefaultValue(meta, value) {
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
                valor = value !== "" ? getDefaultValues(meta.relation, value) : getDefaultValues(meta.relation);
                break;
            default:
                valor = value !== "" ? (value === 0 ? "0" : value) : null
        }
    } else {
        valor = null
    }
    return valor
}

function syncDataBtn(entity) {
    $(".toast, .btn-panel-sync").remove();

    if (navigator.onLine) {
        $(".btn-sync-all").remove();
        dbRemote.sync(entity, null, !0).then(() => {
            for (let i in grids) {
                if (typeof grids[i] === "object" && (typeof entity === "undefined" || grids[i].entity === entity)) {
                    grids[i].reload();
                    break;
                }
            }
        });
    } else {
        toast("Sem Conexão", 2000);
    }
}