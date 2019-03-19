const db = {
    exeRead(entity, key) {
        key = typeof key === "string" ? parseInt(key) : key;
        return dbLocal.exeRead('__historic', 1).then(hist => {
            if (typeof hist[entity] === "undefined") {
                return this.exeReadOnline(entity, key)
            } else {
                if (AUTOSYNC) {
                    dbRemote.syncDownload(entity).then(h => {
                        if(h !== 0) {
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
            if(h !== 0) {
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
                for (let k in id) {
                    if (!isNaN(id[k]) && id[k] > 0)
                        allDelete.push(deleteDB(entity, parseInt(id[k]), react))
                }
            } else if (!isNaN(id) && id > 0) {
                allDelete.push(deleteDB(entity, parseInt(id), react))
            }
            return Promise.all(allDelete).then(() => {
                if (AUTOSYNC)
                    dbRemote.syncPost(entity)
            })
        })
    }
};
const dbRemote = {
    sync(entity) {
        if (typeof entity === "string") {
            if (!/^(__|sync)/.test(entity)) {
                return dbRemote.syncDownload(entity).then(down => {
                    if(down !== 0) {
                        let historic = {};
                        historic[entity] = down;
                        dbLocal.exeUpdate('__historic', historic, 1);
                    }
                    return dbRemote.syncPost(entity).then(d => {
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
                        if (data.response === 1 && data.data !== "no-network" && data.data.historic !== 0)
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
                                        response.data[k][col] = getDefaultValue(dicionarios[entity][col], response.data[k][col], dicionarios);
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
    }, syncPost(entity) {
        return dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            if (!dadosSync.length)
                return 0;
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: HOME + 'set',
                    data: {lib: "entity", file: "up/entity", entity: entity, dados: convertEmptyArrayToNull(dadosSync)},
                    success: function (data) {
                        if (data.response === 1 && data.data !== "no-network" && typeof data.data === "object")
                            resolve(data.data);
                        resolve(0)
                    },
                    error: function () {
                        resolve(0)
                    },
                    dataType: "json",
                    async: !1
                })
            }).then(response => {
                if (response === 0)
                    return 0;
                if (response.error > 0)
                    toast((response.error === 1 ? "1 registro com erro" : response.error + " registros possuem erros"), 4000, "toast-error");
                dbLocal.clear('sync_' + entity);
                let historicData = {};
                historicData[entity] = response.historic;
                dbLocal.exeUpdate("__historic", historicData, 1);
                let syncData = moveSyncDataToDb(entity, response.data);
                let react = dbLocal.exeRead("__reactOnline");
                return Promise.all([syncData, react]).then(r => {
                    syncData = r[0];
                    react = r[1];
                    $.each(syncData, function (i, syncD) {
                        let dados = Object.assign({}, syncD);
                        if (typeof dados === "object" && typeof dados.db_action !== "undefined" && typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][dados.db_action] !== "undefined")
                            eval(react[0][entity][dados.db_action])
                    });
                    return syncData
                });
                return 1
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
        return dbLocal.exeRead('sync_' + entity, id).then(d => {
            return [parseInt(id), ((Object.entries(d).length === 0 && d.constructor === Object) || d.db_action === 'update' ? 'update' : 'create')]
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
        let idOld = parseInt(d.id_old);
        let ac = d.db_action;
        delete (d.db_action);
        delete (d.id_old);
        if (d.constructor === Object && !isEmpty(d) && !isNaN(d.id)) {
            switch (ac) {
                case 'create':
                case 'update':
                    let id = parseInt(d.id);
                    for (let col in d)
                        d[col] = getDefaultValue(dicionarios[entity][col], d[col], dicionarios);
                    d.id = id;
                    if (!isEmpty(d.ownerpub) && parseInt(d.ownerpub) !== parseInt(getCookie("id"))) {
                        movedAsync.push(dbLocal.exeDelete(entity, d.id))
                    } else {
                        movedAsync.push(dbLocal.exeCreate(entity, d))
                    }
                    break;
                case 'delete':
                    if (typeof d.delete !== "undefined" && d.delete.constructor === Array) {
                        for (let k in d.delete) {
                            if (!isNaN(d.delete[k]) && d.delete[k] > 0)
                                movedAsync.push(dbLocal.exeDelete(entity, d.delete[k]))
                        }
                    } else if (!isNaN(d.delete) && d.delete > 0) {
                        movedAsync.push(dbLocal.exeDelete(entity, d.delete))
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
        return dbLocal.exeRead("sync_" + entity, id).then(d => {
            if (Object.entries(d).length === 0 && d.constructor === Object) {
                return dbLocal.exeCreate("sync_" + entity, {'id': id, 'delete': id, 'db_action': 'delete'})
            } else {
                if (d.db_action === "create") {
                    return dbLocal.exeDelete("sync_" + entity, id)
                } else if (d.db_action === "update") {
                    return dbLocal.exeCreate("sync_" + entity, {'id': id, 'delete': id, 'db_action': 'delete'}, id)
                }
            }
        })
    })
}

function getDefaultValue(meta, value, dicionarios) {
    let valor = "";
    if (typeof meta === "object" && meta !== null) {
        if ((['boolean', 'status'].indexOf(meta.format) === -1 && value === !1) || value === null)
            value = ""; else if (meta.type === "json")
            value = typeof value === "object" ? value : (isJson(value) ? JSON.parse(value) : ""); else if (meta.group === "date")
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
                    options.push(e.option.toString())
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
                valor = value !== "" ? value : getDefaultValues({dicionario: dicionarios[meta.relation]});
                break;
            default:
                valor = value !== "" ? value : null
        }
    } else {
        valor = null
    }
    return valor
}