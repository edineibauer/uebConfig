function exeReadApplyFilter(data, filter) {
    let dataFiltered = [];

    for (var k in data) {
        if (typeof data[k] === "object") {
            let dd = data[k];
            let passou = !0;
            for (var f in filter) {
                if (typeof filter[f] === "object" && passou) {
                    let filterOption = filter[f];
                    passou = !1;

                    if (filterOption.operator === "por") {
                        $.each(dd, function (col, valor) {
                            if (typeof valor === "string" && valor !== "" && col !== 'ownerpub' && col !== 'autorpub' && valor.toLowerCase().indexOf(filterOption.value.toLowerCase()) > -1) {
                                passou = !0;
                                return !1
                            }
                        });

                    } else if (typeof dd[filterOption.column] !== "undefined") {

                        if (typeof dd[filterOption.column] === "string") {
                            dd[filterOption.column] = dd[filterOption.column].toLowerCase();
                            filterOption.value = filterOption.value.toLowerCase()
                        }
                        switch (filterOption.operator) {
                            case 'contém':
                                passou = (typeof dd[filterOption.column] !== "string" || dd[filterOption.column].indexOf(filterOption.value) > -1);
                                break;
                            case 'igual a':
                                passou = (dd[filterOption.column] == filterOption.value);
                                break;
                            case 'diferente de':
                                passou = (dd[filterOption.column] != filterOption.value);
                                break;
                            case 'começa com':
                                passou = (typeof dd[filterOption.column] !== "string" || dd[filterOption.column].indexOf(filterOption.value) === 0);
                                break;
                            case 'termina com':
                                passou = (typeof dd[filterOption.column] !== "string" || dd[filterOption.column].indexOf(filterOption.value) === (dd[filterOption.column].length - filterOption.value.length));
                                break;
                            case 'maior que':
                                passou = (dd[filterOption.column] > filterOption.value);
                                break;
                            case 'menor que':
                                passou = (dd[filterOption.column] < filterOption.value);
                                break;
                            case 'maior igual a':
                                passou = (dd[filterOption.column] >= filterOption.value);
                                break;
                            case 'menor igual a':
                                passou = (dd[filterOption.column] <= filterOption.value);
                                break
                        }
                    }
                }
            }
            if (passou)
                dataFiltered.push(dd)
        }
    }

    return dataFiltered;
}

function exeRead(entity, filter, order, reverse, limit, offset) {
    filter = typeof filter === "object" ? filter : {};
    order = typeof order === "string" ? order : "id";
    reverse = (typeof reverse !== "undefined" ? (reverse ? !0 : !1) : !1);
    limit = parseInt(typeof limit === "number" ? limit : (localStorage.limitGrid ? localStorage.limitGrid : 15));
    limit = limit > parseInt(LIMITOFFLINE) ? parseInt(LIMITOFFLINE) : limit;
    offset = parseInt((typeof offset === "number" ? offset : 0) - 1);

    return dbLocal.exeRead(entity).then(data => {
        if (parseInt(data.length) >= parseInt(LIMITOFFLINE)) {
            return new Promise(function (resolve, reject) {
                //online
                $.ajax({
                    type: "POST",
                    url: HOME + 'set',
                    data: {
                        lib: "entity",
                        file: "load/entity",
                        entity: entity,
                        filter: filter,
                        order: order,
                        reverse: reverse,
                        limit: limit,
                        offset: offset,
                        historic: null
                    },
                    success: function (dados) {
                        if (dados.response === 1 && dados.data.historic !== 0) {
                            dados = dados.data;
                            let hist = {};
                            hist[entity] = dados.historic;
                            dbLocal.exeUpdate("__historic", hist, 1);

                            if (typeof data !== "undefined" && typeof dados.data !== "undefined") {

                                let contRemoved = 0;
                                for(let t in dados.data) {
                                    if(typeof dados.data[t] === "object") {
                                        dbLocal.exeDelete(entity, dados.data[t].id);
                                        contRemoved++;
                                    }
                                }

                                let delNum = parseInt(data.length) - parseInt(LIMITOFFLINE) + dados.data.length - contRemoved;
                                for (let i = 0; i < delNum; i++) {
                                    if (typeof data[i] === "object")
                                        dbLocal.exeDelete(entity, data[i].id)
                                }
                            }

                            moveSyncDataToDb(entity, dados.data).then(() => {
                                resolve({
                                    data: dados.data,
                                    lenght: dados.data.length,
                                    total: dados.total,
                                });
                            });
                        } else {
                            toast("Informações Limitadas. Sem Conexão!", 3000, "toast-warning");
                            resolve(readOffline(data, filter, order, reverse, limit, offset));
                        }
                    },
                    error: function(e) {
                        toast("Informações Limitadas. Sem Conexão!", 3000, "toast-warning");
                        resolve(readOffline(data, filter, order, reverse, limit, offset));
                    },
                    dataType: "json",
                });
            })

        } else {
            //offline
            return readOffline(data, filter, order, reverse, limit, offset);
        }
    });
}

function readOffline(data, filter, order, reverse, limit, offset) {
    let result = {
        data: [],
        total: data.length,
        lenght: 0
    };

    //FILTER
    if (!isEmpty(filter)) {
        data = exeReadApplyFilter(data, filter);
        result.total = data.length;
    }

    //ORDER
    data.sort(dynamicSort(order));

    //REVERSE
    if (reverse)
        data.reverse();

    //LIMIT OFFSET
    let i = 0;
    for (var k in data) {
        if (typeof data[k] === "object") {
            if (k > offset && i < limit) {
                result.data.push(data[k]);
                i++;

                if (i == limit)
                    break;
            }
        }
    }

    result.lenght = result.data.length;

    return result;
}

const db = {
    exeRead(entity, key) {
        key = typeof key === "string" ? parseInt(key) : key;
        return dbLocal.exeRead('__historic', 1).then(hist => {
            if (typeof hist[entity] === "undefined") {
                return this.exeReadOnline(entity, key)
            } else {
                if (AUTOSYNC) {
                    dbRemote.syncDownload(entity).then(h => {
                        if (h !== 0) {
                            let historic = {};
                            historic[entity] = h;
                            dbLocal.exeUpdate('__historic', historic, 1);
                        }
                    });
                }
                return dbLocal.exeRead(entity, key).then(d => {
                    if (d.length === 0) {
                        delete (hist[entity]);
                        return dbLocal.exeCreate("__historic", hist).then(() => {
                            return this.exeReadOnline(entity, key)
                        })
                    }
                    return d
                })
            }
        })
    }, exeReadOnline(entity, key) {
        return dbRemote.syncDownload(entity).then(h => {
            if (h !== 0) {
                let historic = {};
                historic[entity] = h;
                dbLocal.exeUpdate('__historic', historic, 1);
            }
            return dbLocal.exeRead(entity, key)
        })
    }, exeCreate(entity, dados) {
        let idAction = getIdAction(entity, dados.id);
        let react = dbLocal.exeRead("__react");
        return Promise.all([idAction, react]).then(r => {
            dados.id = r[0][0];
            let action = r[0][1];
            react = r[1];
            return dbLocal.exeCreate(entity, dados).then(() => {
                if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                    eval(react[0][entity][action])
            }).then(() => {
                dados.db_action = action;
                return dbLocal.insert("sync_" + entity, dados, dados.id).then(() => {
                    if (AUTOSYNC)
                        return dbRemote.syncPost(entity);
                    return dados.id;
                });
            })
        })
    }, exeDelete(entity, id) {
        return dbLocal.exeRead("__react").then(react => {
            let allDelete = [];
            if (id.constructor === Array) {
                let ids = [];
                for (let k in id) {
                    if (!isNaN(id[k]) && id[k] > 0) {
                        let idU = parseInt(id[k]);
                        allDelete.push(deleteDB(entity, idU, react).then(() => {
                            return dbLocal.exeRead("sync_" + entity, idU).then(d => {
                                if ((Object.entries(d).length === 0 && d.constructor === Object) || d.db_action === "update") {
                                    ids.push(idU);
                                } else if (d.db_action === "create") {
                                    return dbLocal.exeDelete("sync_" + entity, idU)
                                }
                            })
                        }));
                    }
                }

                return Promise.all(allDelete).then(() => {
                    return dbLocal.exeCreate("sync_" + entity, {'id': ids, 'db_action': 'delete'}).then(() => {
                        if (AUTOSYNC)
                            dbRemote.syncPost(entity)
                    })
                })
            } else if (!isNaN(id) && id > 0) {
                id = parseInt(id);
                return deleteDB(entity, id, react).then(() => {
                    return dbLocal.exeRead("sync_" + entity, id).then(sync => {
                        if ((Object.entries(sync).length === 0 && sync.constructor === Object) || d.db_action === "update") {
                            return dbLocal.exeCreate("sync_" + entity, {'id': id, 'db_action': 'delete'})
                        } else if (sync.db_action === "create") {
                            return dbLocal.exeDelete("sync_" + entity, id)
                        }
                    }).then(() => {
                        if (AUTOSYNC)
                            dbRemote.syncPost(entity);
                    })
                });
            }
        })
    }
};
const dbRemote = {
    sync(entity, feedback) {
        if (typeof entity === "string") {
            if (!/^(__|sync)/.test(entity)) {
                feedback = typeof feedback === "undefined" ? !1 : ([true, 1, "1", "true"].indexOf(feedback) > -1);
                return dbRemote.syncDownload(entity).then(down => {
                    if (down !== 0) {
                        let historic = {};
                        historic[entity] = down;
                        dbLocal.exeUpdate('__historic', historic, 1)
                    }
                    return dbRemote.syncPost(entity, feedback).then(d => {
                        return down === 0 ? d : 1
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
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: HOME + 'set',
                    data: {lib: "entity", file: "load/entity", entity: entity, historic: (hist[entity] || null)},
                    success: function (data) {
                        if (data.response === 1 && data.data.historic !== 0)
                            resolve(data.data);
                        resolve(0)
                    },
                    error: function () {
                        resolve(0)
                    },
                    dataType: "json"
                })
            }).then(response => {
                if (response === 0)
                    return 0;
                if (response.tipo === 1) {
                    return dbLocal.clear(entity).then(() => {
                        let cc = [];
                        if (response.data.length) {
                            for (let k in response.data) {
                                if (!isNaN(k) && typeof response.data[k] === "object" && typeof response.data[k].id !== "undefined") {
                                    let id = parseInt(response.data[k].id);
                                    for (let col in response.data[k])
                                        response.data[k][col] = getDefaultValue(dicionarios[entity][col], response.data[k][col]);
                                    response.data[k].id = id;
                                    cc.push(dbLocal.exeCreate(entity, response.data[k]));
                                }
                            }
                        }
                        return Promise.all(cc).then(() => {
                            return response.historic;
                        })
                    })
                } else {
                    return moveSyncDataToDb(entity, response.data).then(() => {
                        return response.historic;
                    })
                }
            }).then(response => {
                return response;
            })
        })
    }, syncPost(entity, feedback) {
        feedback = (typeof feedback === "undefined" ? !1 : ([true, 1, "1", "true"].indexOf(feedback) > -1));
        return dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            if (!dadosSync.length)
                return 0;
            return new Promise(function (resolve, reject) {
                if (navigator.onLine) {
                    let promises = [];
                    let dadosRetorno = [];
                    let total = dadosSync.length;
                    let totalParte = (100 / total);
                    let progress = 0.00;
                    let count = 0;
                    let fail = 0;
                    let react = dbLocal.exeRead("__reactOnline");

                    $("#core-upload-progress").css("height", "5px");
                    toast("<div class='left'><div class='left'>Enviando</div><div id='core-count-progress' class='left'>0</div><div class='left'>/" + total + " registros para " + entity + "</div></div>", 1000000, "toast-upload-progress");

                    $.each(dadosSync, function (i, d) {
                        let dataToSend = [];
                        dataToSend.push(d);

                        promises.push(new Promise(function (s, f) {
                            $.ajax({
                                type: "POST",
                                url: HOME + 'set',
                                data: {
                                    lib: "entity",
                                    file: "up/entity",
                                    entity: entity,
                                    dados: convertEmptyArrayToNull(dataToSend)
                                },
                                success: function (data) {
                                    if (data.response === 1 && typeof data.data === "object") {
                                        count++;

                                        if($("#core-count-progress").length)
                                            $("#core-count-progress").html(count);
                                        else
                                            toast("<div class='left'><div class='left'>Enviando</div><div id='core-count-progress' class='left'>" + count + "</div><div class='left'>/" + total + " registros para " + entity + "</div></div>", 1000000, "toast-upload-progress");

                                    } else {
                                        fail++;
                                    }
                                },
                                error: function () {
                                    fail++;
                                },
                                complete: function (dd) {
                                    dd = JSON.parse(dd.responseText);
                                    console.log(dataToSend[0]);
                                    if(dd.response === 1) {
                                        dbLocal.exeDelete('sync_' + entity, dataToSend[0].id);

                                        if (dd.data.error === 0) {

                                            let historicData = {};
                                            historicData[entity] = dd.data.historic;
                                            dbLocal.exeUpdate("__historic", historicData, 1);

                                            let syncData = moveSyncDataToDb(entity, dd.data.data);
                                            s(Promise.all([syncData, react]).then(r => {
                                                syncData = r[0];
                                                react = r[1];
                                                $.each(syncData, function (i, syncD) {
                                                    let dados = Object.assign({}, syncD);
                                                    if (typeof dados === "object" && typeof dados.db_action !== "undefined" && typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][dados.db_action] !== "undefined")
                                                        eval(react[0][entity][dados.db_action])
                                                });
                                                return syncData;
                                            }));
                                        } else {
                                            fail++;
                                        }
                                    } else {
                                        fail++;
                                    }

                                    progress += totalParte;
                                    $("#core-upload-progress-bar").css("width", progress + "%");
                                    s(1);

                                },
                                dataType: "json",
                                async: !0
                            });
                        }));
                    });

                    Promise.all(promises).then(() => {
                        let msg = (fail === 0 ? "Registros de " + entity + " enviados!" : (total > 1 ? "Erro em " + fail + " dos " + total + " registro para " + entity: "Erro no registro para " + entity));
                        toast(msg, 3000, (fail > 0 ? "toast-error" : "toast-success") + " toast-upload-progress");
                        $("#core-upload-progress").css("height", 0);
                        setTimeout(function () {
                            $("#core-upload-progress-bar").css("width", 0);
                        },600);

                        resolve(1);
                    });
                } else {
                    resolve(1);
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
    }, exeRead(entity, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            if (typeof key !== "undefined" && !isNaN(key)) {
                return dbLocalTmp.transaction(entity).objectStore(entity).get(key).then(v => {
                    return (typeof v !== "undefined" ? v : {})
                })
            } else {
                return dbLocalTmp.transaction(entity).objectStore(entity).getAll().then(v => {
                    return (typeof v !== "undefined" ? v : {})
                })
            }
        })
    }, exeCreate(entity, val) {
        let id = (/^__/.test(entity) ? 1 : (!isNaN(val.id) && val.id > 0 ? parseInt(val.id) : 0));
        if (id > 0) {
            if (!isNaN(val.id) && val.id > 0)
                val.id = parseInt(val.id);
            return dbLocal.insert(entity, val, id)
        } else {
            return dbLocal.newKey(entity).then(key => {
                return dbLocal.insert(entity, val, key)
            })
        }
    }, exeDelete(entity, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            const tx = dbLocalTmp.transaction(entity, 'readwrite');
            tx.objectStore(entity).delete(parseInt(key));
            return tx.complete
        })
    }, exeUpdate(entity, dados, key) {
        key = parseInt(key);
        return dbLocal.exeRead(entity, key).then(data => {
            for (let name in dados)
                data[name] = dados[name];
            data.id = key;
            return this.exeCreate(entity, data);
        })
    }, insert(entity, val, key) {
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
    }, keys(entity) {
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
}

function getIdAction(entity, id) {
    if (isNaN(id) || id < 1) {
        return dbLocal.newKey(entity).then(key => {
            return [key, 'create']
        })
    } else {
        return db.exeRead("sync_" + entity, id).then(d => {
            if(isEmpty(d)) {
                return db.exeRead(entity, id).then(d => {
                    return [parseInt(id), (isEmpty(d) ? 'create' : 'update')]
                })
            } else {
                return [parseInt(id), (d.db_action === 'update' ? 'update' : 'create')];
            }
        })
    }
}

function moveSyncDataToDb(entity, dados) {
    if (dados.constructor === Object) {
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
        if (d.constructor === Object && !isEmpty(d) && !isNaN(d.id)) {
            switch (ac) {
                case 'create':
                case 'update':
                    let id = parseInt(d.id);
                    for (let col in d)
                        d[col] = getDefaultValue(dicionarios[entity][col], d[col]);
                    d.id = id;
                    if (!isEmpty(d.ownerpub) && parseInt(d.ownerpub) !== parseInt(getCookie("id"))) {
                        movedAsync.push(dbLocal.exeDelete(entity, d.id))
                    } else {
                        movedAsync.push(dbLocal.exeCreate(entity, d))
                    }
                    break;
                case 'delete':
                    if (typeof d.id !== "undefined" && d.id.constructor === Array) {
                        for (let k in d.id) {
                            if (!isNaN(d.id[k]) && d.id[k] > 0)
                                movedAsync.push(dbLocal.exeDelete(entity, d.id[k]))
                        }
                    }
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
        if (meta.format !== "information" && meta.key !== "identifier") {
            let value = (typeof values !== "undefined" && typeof values[meta.column] !== "undefined" ? values[meta.column] : meta.default)
            valores[column] = getDefaultValue(meta, value)
        }
    });
    return valores
}

function getDefaultValue(meta, value) {
    let valor = "";
    if (typeof meta === "object" && meta !== null) {
        if ((['boolean', 'status'].indexOf(meta.format) === -1 && value === !1) || value === null)
            value = "";
        else if (meta.type === "json")
            value = typeof value === "object" ? value : (isJson(value) ? JSON.parse(value) : ((typeof value === 'number' || typeof value === 'string') && value !== "" ? JSON.parse("[" + value + "]") : ""));
        else if (meta.group === "date")
            value = value.replace(" ", "T");
        switch (meta.format) {
            case 'boolean':
            case 'status':
                valor = value === !0 || value === 1 || value === "1" || value === "true" ? 1 : 0;
                break;
            case 'number':
            case 'year':
                valor = value !== "" && !isNaN(value) ? parseInt(value) : null;
                break;
            case 'percent':
                valor = value !== "" ? parseFloat(parseFloat(value.toString().replace(',', '.').replace('%', '')).toFixed(2)) : null;
                break;
            case 'valor':
                let f = "";
                for (let i = 0; i < value.length; i++) {
                    if (!isNaN(value[i]))
                        f += value[i];
                    else if (value[i] === "." || value[i] === ",")
                        f = f.replace(".", "") + ".";
                }
                valor = f !== "" && !isNaN(f) ? f : null;
                break;
            case 'float':
                value = (typeof value === "string" ? value.replace(',', '.') : value);
                valor = value !== "" && !isNaN(value) ? parseFloat(value) : null;
                break;
            case 'date':
                if (['date', 'now', 'agora', 'data', 'hoje'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = dataAgora.getFullYear() + "-" + zeroEsquerda(dataAgora.getMonth() + 1) + "-" + zeroEsquerda(dataAgora.getDate())
                } else {
                    valor = value !== "" ? value : null
                }
                break;
            case 'datetime':
                if (['date', 'now', 'agora', 'data', 'hoje', 'datetime'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = dataAgora.getFullYear() + "-" + zeroEsquerda(dataAgora.getMonth() + 1) + "-" + zeroEsquerda(dataAgora.getDate()) + "T" + zeroEsquerda(dataAgora.getHours()) + ":" + zeroEsquerda(dataAgora.getMinutes())
                } else {
                    valor = value !== "" ? value : null
                }
                break;
            case 'time':
                if (['date', 'now', 'agora', 'data', 'hoje', 'time'].indexOf(value) > -1) {
                    let dataAgora = new Date(Date.now());
                    valor = zeroEsquerda(dataAgora.getHours()) + ":" + zeroEsquerda(dataAgora.getMinutes())
                } else {
                    valor = value !== "" ? value : null
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

    if(navigator.onLine) {
        dbRemote.sync(entity, 1).then(isUpdated => {
            if ((typeof entity === "undefined" || isUpdated) && typeof grids !== "undefined" && grids.length) {
                $.each(grids, function (i, e) {
                    if (typeof entity === "undefined" || e.entity === entity)
                        e.reload(1);
                })
            }
        })
    } else {
        toast("Sem Conexão", 2000);
    }
}