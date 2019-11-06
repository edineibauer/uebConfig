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

function moveSyncInfoToDb(entity, id) {
    id = typeof id === "undefined" || isNaN(a) ? null : id;

    let readData = (id ? dbLocal.exeRead('sync_' + entity, id) : dbLocal.exeRead('sync_' + entity));
    return Promise.all([readData]).then(dadosSync => {
        dadosSync = (typeof id === "number" ? dadosSync : dadosSync[0]);

        if (!dadosSync.length)
            return;

        $.each(dadosSync, function (i, d) {
            moveSyncDataToDb(entity, d, !1);
        });

        return dadosSync;
    });
}

function exeRead(entity, filter, order, reverse, limit, offset) {
    filter = typeof filter === "object" ? filter : {};
    order = typeof order === "string" ? order : "id";
    reverse = (typeof reverse !== "undefined" ? (reverse ? !0 : !1) : !1);
    limit = parseInt(typeof limit === "number" ? limit : (localStorage.limitGrid ? localStorage.limitGrid : 15));
    limit = limit > parseInt(LIMITOFFLINE) ? parseInt(LIMITOFFLINE) : limit;
    offset = parseInt((typeof offset === "number" ? offset : 0) - 1);

    return db.exeRead(entity).then(data => {
        if(!SERVICEWORKER)
            return data;

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
                                for (let t in dados.data) {
                                    if (typeof dados.data[t] === "object") {
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
                                if(offset === -1) {
                                    moveSyncInfoToDb(entity).then(syncD => {
                                        let dd = (syncD ? syncD.concat(dados.data) : dados.data);
                                        resolve({data: dd, lenght: dd.length, total: dados.total})
                                    })
                                } else {
                                    resolve({data: dados.data, lenght: dados.data.length, total: dados.total});
                                }
                            });
                        } else {
                            toast("Sem Conexão! Conecte para atualizar os registros", 7000, "toast-warning");
                            resolve(readOffline(data, filter, order, reverse, limit, offset));
                        }
                    },
                    error: function (e) {
                        toast("Sem Conexão! Conecte para atualizar os registros", 7000, "toast-warning");
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

var syncGridCheck = [];

function checkToUpdateDbLocal(entity) {
    if(!SERVICEWORKER)
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

function dbSendData(entity, dados, action) {
    dados.db_action = action;
    if(action === "create")
        dados.id = 0;
    let t = [];
    t.push(dados);
    return new Promise(function (s, f) {
        $.ajax({
            type: "POST",
            url: HOME + 'set',
            data: {
                lib: "entity",
                file: "up/entity",
                entity: entity,
                dados: convertEmptyArrayToNull(t)
            },
            error: function () {
                toast("Sem conexão! Tente mais tarde", 3500, "toast-error");
                f(0);
            },
            success: function (dd) {
                let allP = [];
                if (dd.response === 1 && dd.data.error === 0) {
                    allP.push(dd.data.data[0]);
                    s(allP);
                } else {
                    navigator.vibrate(100);
                    showErrorField(form.$element, dd.data.data[0].db_error[form.entity], dicionarios[form.entity], form.entity, 1);
                    setFormSaveStatus(form, 1);
                    toast("Erro ao cadastrar, corrija o formulário", 7000, "toast-error");
                    f(0);
                }
            },
            dataType: "json",
            async: !0
        })
    });
}

const db = {
    exeRead(entity, key) {
        let Reg = new RegExp('^(sync_|__)', 'i');
        if(Reg.test(entity)) {
            toast("[Erro de programação] não é possível LER registros Sync Online.", 5000, "toast-error");
            return;
        }
        key = typeof key === "string" ? parseInt(key) : key;

        if(SERVICEWORKER) {
            return dbRemote.syncDownload(entity).then(() => {
                return dbLocal.exeRead(entity, key)
            });
        } else {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    type: "POST",
                    url: HOME + 'set',
                    data: {lib: "entity", file: "load/entity", entity: entity, id: key, historic: null},
                    success: function (data) {
                        if (data.response === 1 && data.data.historic !== 0){
                            if(!isNaN(key) && key > 0)
                                resolve(data.data.data[0]);
                            else
                                resolve(data.data);
                        }
                        resolve(0)
                    },
                    error: function () {
                        resolve(0)
                    },
                    dataType: "json"
                })
            })
        }
    }, exeCreate(entity, dados, sync) {
        if(SERVICEWORKER) {
            sync = typeof sync === "undefined" ? !0 : sync;
            let idAction = getIdAction(entity, dados.id);
            let react = dbLocal.exeRead("__react");
            return Promise.all([idAction, react]).then(r => {
                dados.id = r[0][0];
                dados.db_status = !1;
                let action = r[0][1];
                react = r[1];
                return dbLocal.exeCreate(entity, dados).then(() => {
                    dados.db_action = action;
                    return dbLocal.insert("sync_" + entity, dados, dados.id).then(() => {
                        if (sync)
                            return dbRemote.syncPost(entity, dados.id);

                        return Object.assign([{db_errorback : 0}, dados]);
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
    }, exeDelete(entity, id) {
        if(SERVICEWORKER) {
            return dbLocal.exeRead("__react").then(react => {
                let allDelete = [];
                let ids = [];
                let idSync = [];

                //Aceita id sendo número ou array
                if (typeof id !== "undefined" && !isNaN(id) && id > 0)
                    ids.push(id);
                else if (typeof id === "object" && id !== null && id.constructor === Array)
                    ids = id;

                if (ids.length) {
                    for (let k in ids) {
                        if (!isNaN(ids[k]) && ids[k] > 0) {
                            let idU = parseInt(ids[k]);
                            allDelete.push(deleteDB(entity, idU, react).then(() => {
                                return dbLocal.exeRead("sync_" + entity, idU).then(d => {
                                    if ((Object.entries(d).length === 0 && d.constructor === Object) || d.db_action === "update") {
                                        idSync.push(idU)
                                    } else if (d.db_action === "create") {
                                        return dbLocal.exeDelete("sync_" + entity, idU)
                                    }
                                })
                            }))
                        }
                    }
                    return Promise.all(allDelete).then(() => {
                        if (idSync.length) {
                            allDelete = [];
                            $.each(idSync, function (i, ii) {
                                allDelete.push(dbLocal.exeCreate("sync_" + entity, {
                                    'id': ii,
                                    'db_action': 'delete'
                                }).then(id => {
                                    return dbRemote.syncPost(entity, id);
                                }));
                            });

                            return Promise.all(allDelete);
                        }
                    })
                }
            })
        } else {
            let t = [];
            $.each(id, function (i, e) {
                t.push(dbSendData(entity, {id: parseInt(e)}, 'delete'));
            });
            return Promise.all(t);
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
                    let dic = dbLocal.exeRead("__dicionario", 1);
                    let clear = dbLocal.clear(entity);
                    return Promise.all([dic, clear]).then(r => {
                        dicionarios = r[0];
                        let cc = [];
                        if (response.data.length) {
                            for (let k in response.data) {
                                if (!isNaN(k) && typeof response.data[k] === "object" && typeof response.data[k].id !== "undefined") {
                                    let id = parseInt(response.data[k].id);
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
                    if(!isEmpty(r[0])) {
                        lastKey = r[1] > r[2] ? r[1] : r[2];
                        $.each(r[0], function (i, s) {
                            //depois de criar esse registro, verifica possível conflito com sync ID
                            prom.push(dbLocal.exeRead(entity, parseInt(s.id)).then(e => {
                                if (!isEmpty(e) && e.db_status === !0) {
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
                                    let allP = [];
                                    if (data.response === 1 && typeof data.data === "object" && data.data.error === 0) {
                                        if (feedback) {
                                            count++;
                                            if ($("#core-count-progress").length)
                                                $("#core-count-progress").html(count); else toast("<div style='float:left'><div style='float:left'>Enviando</div><div id='core-count-progress' style='float:left'>" + count + "</div><div style='float:left'>/" + total + " registros para " + entity + "</div></div>", 1000000, "toast-upload-progress")
                                        }

                                        dataReturn = Object.assign({db_errorback: 0}, data.data.data[0]);

                                        /**
                                         * Atualização realizada, remove sync desta atualização
                                         * */
                                        if (!isNaN(d.id)) {
                                            dbLocal.exeDelete('sync_' + entity, d.id);
                                            dbLocal.exeDelete(entity, d.id);
                                            if (d.db_action !== "delete")
                                                allP.push(moveSyncDataToDb(entity, data.data.data[0]));

                                            /**
                                             * Atualiza histórico
                                             * */
                                            let historicData = {};
                                            historicData[entity] = data.data.historic;
                                            dbLocal.exeUpdate("__historic", historicData, 1)
                                        }

                                    } else {
                                        fail++;

                                        if (typeof data.data.data[0].db_error[entity] === "object")
                                            dataReturn = Object.assign({db_errorback: 1}, data.data.data[0].db_error[entity]);
                                    }

                                    if (feedback) {
                                        progress += totalParte;
                                        $("#core-upload-progress-bar").css("width", progress + "%")
                                    }

                                    Promise.all(allP).then(() => {
                                        s(dataReturn)
                                    });
                                },
                                error: function () {
                                    failNetwork = !0;
                                    fail++;
                                    s({db_errorback: 1, 0: {"rede": "Falha na Comunicação"}});
                                },
                                dataType: "json",
                                async: !0
                            })
                        }))
                    });
                    Promise.all(promises).then(p => {
                        if (feedback) {
                            if(total === 1) {
                                if(p[0].db_errorback === 1) {
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
    }, exeRead(entity, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            if (typeof key !== "undefined" && !isNaN(key)) {
                return dbLocalTmp.transaction(entity).objectStore(entity).get(key).then(v => {
                    return (typeof v !== "undefined" ? v : {})
                }).catch(c => {
                    return {};
                });
            } else {
                return checkToUpdateDbLocal(entity).then(() => {
                    return dbLocalTmp.transaction(entity).objectStore(entity).getAll().then(v => {
                        return (typeof v !== "undefined" ? v : {})
                    }).catch(err => {
                        navigator.webkitTemporaryStorage.queryUsageAndQuota ((usedBytes, grantedBytes) => {
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
        let keyReg = dbLocal.newKey(entity);
        let keySync = dbLocal.newKey("sync_" + entity);
        return Promise.all([keyReg, keySync]).then(r => {
            return [(r[0] > r[1] ? r[0] : r[1]), 'create']
        })
    } else {
        return dbLocal.exeRead("sync_" + entity, id).then(d => {
            if (isEmpty(d)) {
                return dbLocal.exeRead(entity, id).then(d => {
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
                    d.db_status = db_status;
                    if (!isEmpty(d.ownerpub) && parseInt(d.ownerpub) !== parseInt(getCookie("id"))) {
                        movedAsync.push(dbLocal.exeDelete(entity, d.id))
                    } else {
                        movedAsync.push(dbLocal.exeCreate(entity, d))
                    }
                    break;
                case 'delete':
                    if (!isNaN(d.id) && d.id > 0)
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

        if(typeof value === "object" && value.constructor === Array) {
            if(meta.key === "relation") {
                $.each(value, function (i, e) {
                    if(typeof e.columnTituloExtend !== "string") {
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

            } else if(meta.key === "source") {
                let reg = new RegExp("^image", "i");
                $.each(value, function (i, e) {
                    if(typeof e.isImage === "undefined")
                        value[i].isImage = reg.test(e.fileType);
                })
            }
        }

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
                if(typeof value === "number")
                    value = value.toString();

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

    if (navigator.onLine) {
        dbRemote.sync(entity, null, !0).then(isUpdated => {
            for(let i in grids) {
                if(typeof grids[i] === "object" && (typeof entity === "undefined" || grids[i].entity === entity)) {
                    grids[i].reload();
                    break;
                }
            }
        });
    } else {
        toast("Sem Conexão", 2000);
    }
}