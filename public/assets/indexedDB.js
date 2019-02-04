function moveSyncDataToDb(entity, dados) {
    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
        let movedAsync = [];
        for (let k in dados) {
            let d = dados[k];
            if (d.constructor === Object) {
                let ac = d.db_action;
                delete (d.db_action);
                switch (ac) {
                    case 'create':
                    case 'update':
                        let id = parseInt(d.id);
                        for (let col in d)
                            d[col] = getDefaultValue(dicionarios[entity][col], d[col]);
                        d.id = id;
                        movedAsync.push(dbLocal.exeCreate(entity, d));
                        break;
                    case 'delete':
                        if (d.delete.constructor === Array) {
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
        }
        return Promise.all(movedAsync)
    });
}

function deleteDB(entity, id) {
    return dbLocal.exeDelete(entity, id).then(() => {
        return dbLocal.exeRead("__react").then(react => {
            if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                eval(react[0][entity][action])
        }).then(() => {
            return dbLocal.exeRead("sync_" + entity).then(d => {
                if (typeof d === "object") {
                    for (let k in d) {
                        if (typeof d[k] === "object" && !isNaN(d[k]['id']) && d[k]['id'] === id) {
                            if (d[k]['db_action'] === "create") {
                                return dbLocal.exeDelete("sync_" + entity, id);
                            } else if (d[k]['db_action'] === "update") {
                                return dbLocal.exeDelete("sync_" + entity, id).then(() => {
                                    return dbLocal.newKey("sync_" + entity).then(key => {
                                        return dbLocal.insert("sync_" + entity, {
                                            'id': key,
                                            'delete': id,
                                            'db_action': 'delete'
                                        }, key)
                                    })
                                });
                            }
                        }
                    }
                }
                return dbLocal.newKey("sync_" + entity).then(key => {
                    return dbLocal.insert("sync_" + entity, {'id': key, 'delete': id, 'db_action': 'delete'}, key)
                })
            })
        })
    })
}

function getDefaultValue(meta, value) {
    let valor = "";
    if (typeof meta === "object" && meta !== null) {
        if ((['boolean', 'status'].indexOf(meta.format) === -1 && value === !1) || value === null)
            value = ""; else if (meta.type === "json")
            value = typeof value === "object" ? value : (isJson(value) ? JSON.parse(value) : ""); else if (meta.group === "date")
            value = value.replace(" ", "T");
        switch (meta.format) {
            case 'boolean':
            case 'status':
                valor = value === !0 || value === 1 || value === "1" || value === "true";
                break;
            case 'number':
            case 'year':
                valor = value !== "" && !isNaN(value) ? parseInt(value) : null;
                break;
            case 'percent':
                valor = value !== "" ? parseFloat(parseFloat(value.toString().replace(',', '.').replace('%', '')).toFixed(2)) : null;
                break;
            case 'valor':
                if (typeof value === "string")
                    value = parseFloat(value.replaceAll('\\.', '').replace(',', '.'));
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

const dbRemote = {
    sync(entity) {
        if (typeof entity === "string") {
            if (!/^(__|sync)/.test(entity)) {
                return dbRemote.syncDownload(entity).then(down => {
                    if (down)
                        dbRemote.syncUpdate(entity);
                    return dbRemote.syncPost(entity).then(() => {
                        return down
                    })
                })
            } else {
                return new Promise((s, f) => {
                    return s(0)
                })
            }
        } else if (typeof entity === "undefined") {
            return dbLocal.exeRead('__dicionario', 1).then(dicionarios => {
                let allReads = [];
                for (var e in dicionarios)
                    allReads.push(dbRemote.sync(e));
                return Promise.all(allReads)
            })
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
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        if (this.status == 200) {
                            let data = JSON.parse(this.responseText);
                            if (data.response === 1 && typeof data.data !== "no-network" && data.data.historic !== 0)
                                resolve(data.data);
                        }
                        resolve(0);
                    }
                };
                xhttp.open("POST", HOME + "set");
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("lib=entity&file=load/entity&entity=" + entity + "&historic=" + (hist[entity] || null));
            }).then(response => {
                if (response !== 0) {
                    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
                        if (response.tipo === 1) {
                            return dbLocal.clear(entity).then(() => {
                                let cc = [];
                                if (response.data.length) {
                                    for (let k in response.data) {
                                        if (!isNaN(k) && typeof response.data[k] === "object" && typeof response.data[k].id !== "undefined") {
                                            let id = parseInt(response.data[k]['id']);
                                            for(let col in response.data[k])
                                                response.data[k][col] = getDefaultValue(dicionarios[entity][col], response.data[k][col]);
                                            response.data[k]['id'] = id;
                                            cc.push(dbLocal.exeCreate(entity, response.data[k]))
                                        }
                                    }
                                }
                                let historic = {};
                                historic[entity] = response.historic;
                                cc.push(dbLocal.exeUpdate('__historic', historic, 1));
                                return Promise.all(cc).then(() => {
                                    return 1;
                                })
                            });
                        } else {
                            if (response.data.constructor === Array && response.data.length) {
                                let historic = {};
                                historic[entity] = response.historic;
                                return dbLocal.exeUpdate('__historic', historic, 1).then(() => {
                                    return moveSyncDataToDb(entity, response.data).then(() => {
                                        return 1;
                                    })
                                });
                            }
                        }
                    })
                } else {
                    return 0;
                }
            })
        })
    }, syncUpdate(entity) {
        return dbLocal.exeRead('sync_' + entity).then(dados => {
            if (dados.length) {
                moveSyncDataToDb(entity, dados);
                return 1
            }
            return 0
        })
    }, syncPost(entity) {
        return dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            if (!dadosSync.length)
                return 0;

            return new Promise(function (resolve, reject) {
                let longTime = setTimeout(function () {
                    toast("é normal demorar quando tem arquivos para serem enviados!", 5000, "toast-warning");
                },6000);
                let longLongTime = setTimeout(function () {
                    toast("conexão lenta, ou arquivo muito grande! Ainda enviando...", 5000, "toast-warning");
                },20000);
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        clearTimeout(longTime);
                        clearTimeout(longLongTime);
                        if (this.status === 200) {
                            let data = JSON.parse(this.responseText);
                            if (data.response === 1 && typeof data.data !== "no-network" && typeof data.data === "object")
                                resolve(data.data);
                        }
                        resolve(0);
                    }
                };
                xhttp.open("POST", HOME + "set");
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("lib=entity&file=up/entity&entity=" + entity + "&dados=" + JSON.stringify(dadosSync));
            }).then(response => {
                if(response !== 0) {
                    if (response.error > 0) {
                        toast((response.error === 1 ? "1 registro com erro" : response.error + " registros possuem erros"), 4000, "toast-error");
                        setTimeout(function () {
                            toast("registros com erros são ignorados no servidor!", 8000, "toast-error")
                        }, 2000)
                    }
                    return dbLocal.clear('sync_' + entity).then(() => {
                        let historicData = {};
                        historicData[entity] = response.historic;
                        return dbLocal.exeUpdate("__historic", historicData, 1)
                    }).then(() => {
                        for (let k in dadosSync) {
                            let dado = dadosSync[k];
                            if (dado['db_action'] === "create" || dado['db_action'] === "update") {
                                return dbLocal.exeDelete(entity, dado.id).then(() => {
                                    return dbLocal.exeRead("__dicionario", 1).then(dicionarios => {
                                        let id = parseInt(response.data.id);
                                        for(let col in response.data)
                                            response.data[col] = getDefaultValue(dicionarios[entity][col], response.data[col]);
                                        response.data.id = id;

                                        return dbLocal.exeCreate(entity, response.data);
                                    })
                                })
                            }
                        }
                    })
                }
                return 0;
            })
        })
    }
};
const db = {
    exeCreate(entity, dados) {
        let proc = null;
        let action = 'create';
        if (isNaN(dados.id) || dados.id < 1) {
            proc = dbLocal.newKey(entity).then(key => {
                dados.id = key
            })
        } else {
            dados.id = parseInt(dados.id);
            proc = dbLocal.exeRead('sync_' + entity, dados.id).then(d => {
                if ((Object.entries(d).length === 0 && d.constructor === Object) || d.db_action === 'update')
                    action = 'update'
            })
        }
        return proc.then(() => {
            return dbLocal.exeCreate(entity, dados).then(() => {
                dados.db_action = action;
                return dbLocal.insert("sync_" + entity, dados, dados.id)
            }).then(() => {
                return dbLocal.exeRead("__react").then(react => {
                    if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                        eval(react[0][entity][action])
                })
            }).then(() => {
                if (AUTOSYNC)
                    return dbRemote.sync(entity)
            })
        }).then(() => {
            return dados.id
        })
    }, exeDelete(entity, id) {
        let allDelete = [];
        if (id.constructor === Array) {
            for (let k in id) {
                if (!isNaN(id[k]) && id[k] > 0)
                    allDelete.push(deleteDB(entity, parseInt(id[k])))
            }
        } else if (!isNaN(id) && id > 0) {
            allDelete.push(deleteDB(entity, parseInt(id)))
        }
        return Promise.all(allDelete).then(() => {
            if (AUTOSYNC)
                return dbRemote.sync(entity);
            else
                return 0
        })
    }, exeRead(entity, key) {
        if (AUTOSYNC) {
            return dbRemote.sync(entity).then(() => {
                return dbLocal.exeRead(entity, key)
            })
        } else {
            return dbLocal.exeRead(entity, key)
        }
    }
}
const dbLocal = {
    conn(entity) {
        return idb.open(entity, 1, upgradeDB => {
            upgradeDB.createObjectStore(entity)
        })
    }, exeRead(entity, key) {
        return dbLocal.conn(entity).then(dbLocalTmp => {
            if (typeof key !== "undefined") {
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
            return db.exeCreate(entity, data);
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