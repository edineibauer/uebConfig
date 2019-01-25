const dbRemote = {
    sync(entity) {
        if (typeof entity === "string") {
            return dbRemote.syncDownload(entity).then(down => {
                return dbRemote.syncUpdate(entity).then(haveUpdates => {
                    if (haveUpdates)
                        return dbRemote.syncPost(entity);
                    return down;
                })
            })
        } else if (typeof entity === "undefined") {
            return dbLocal.exeRead('__dicionario', 1).then(dicionarios => {
                let allReads = [];
                for (var e in dicionarios)
                    allReads.push(dbRemote.sync(e));

                return Promise.all(allReads);
            })
        } else if (typeof entity === "object" && $.isArray(entity)) {
            let allReads = [];
            for(let k in entity) {
                allReads.push(dbRemote.sync(entity[k]));
            }
            return Promise.all(allReads);
        }
    }, syncDownload(entity) {
        return dbLocal.exeRead('__historic', 1).then(hist => {
            let down = !1;
            let creates = [];

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let data = JSON.parse(this.responseText);
                    if (data.response === 1 && typeof data.data !== "no-network") {
                        if (data.data.historic !== 0) {
                            creates.push(dbLocal.clear(entity).then(() => {
                                let cc = [];
                                if(data.data.data.length) {
                                    for (let k in data.data.data) {
                                        if(!isNaN(k) && typeof data.data.data[k] === "object" && typeof data.data.data[k].id !== "undefined") {
                                            let val = data.data.data[k];
                                            val.id = parseInt(val.id);
                                            cc.push(dbLocal.exeCreate(entity, val));
                                        }
                                    }
                                }
                                cc.push(dbLocal.clear('__historic').then(() => {
                                    hist[entity] = data.data.historic;
                                    return dbLocal.exeCreate('__historic', hist);
                                }));

                                return Promise.all(cc);
                            }));
                            down = !0;
                        }
                    }
                }
            };
            xhttp.open("POST", HOME + "set", !1);
            xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhttp.send("lib=entity&file=load/entity&entity=" + entity + "&historic=" + (hist[entity] || null));

            return Promise.all(creates).then(() => {
                return down;
            })
        })
    }, syncUpdate(entity) {

        return dbLocal.exeRead('sync_' + entity).then(dados => {
            if (dados.length) {
                for(let k in dados) {
                    let d = dados[k];
                    let ac = d.db_action;
                    delete (d.db_action);
                    switch (ac) {
                        case 'create':
                        case 'update':
                            dbLocal.exeCreate(entity, d);
                            break;
                        case 'delete':
                            dbLocal.exeDelete(entity, d.delete);
                            break
                    }
                }
                return 1;
            }
            return 0;
        })
    }, syncPost(entity) {
        return dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            if (dadosSync.length) {
                for(let k in dadosSync) {
                    let dados = dadosSync[k];
                    let syncId = dados.id;
                    let r = false;

                    if (dados.db_action === 'create' || dados.db_action === "update") {
                        if (dados.db_action === "create")
                            delete (dados.id);

                        delete (dados.db_action);
                        $.ajax({
                            type: "POST",
                            url: HOME + 'set',
                            data: convertEmptyArrayToNull({
                                lib: 'entity',
                                file: 'up/entity',
                                entity: entity,
                                dados: dados
                            }),
                            success: function (data) {
                                if (data.response === 1 && typeof data.data.js === "undefined" && typeof data.data.data === "object")
                                    r = data.data
                            },
                            async: false,
                            dataType: "json"
                        });

                    } else if (dados.db_action === 'delete') {
                        $.ajax({
                            type: "POST",
                            url: HOME + 'set',
                            data: convertEmptyArrayToNull({
                                lib: 'entity',
                                file: 'delete/entity',
                                entity: entity,
                                id: dados.delete
                            }),
                            success: function (data) {
                                if (data.response === 1 && typeof data.data.js === "undefined")
                                    r = {error: 0, data: 1};
                            },
                            async: false,
                            dataType: "json"
                        });
                    }

                    if (r) {
                        if(r.data !== 0 && r.error === 0) {
                            return dbLocal.exeDelete('sync_' + entity, syncId).then(() => {
                                return dbLocal.exeRead("__historic", 1).then(hist => {
                                    hist[entity] = r.historic;
                                    return dbLocal.clear('__historic').then(() => {
                                        return dbLocal.exeCreate("__historic", hist)
                                    })
                                });
                            }).then(() => {
                                if((dados.db_action === 'create' || dados.db_action === "update") && !isNaN(r.data) && r.data > 0)
                                    return dbLocal.exeCreate(entity, r.data);
                                return 1;
                            })
                        } else if(r.error !== 0){
                            toast("Servidor não validou o formulário");
                            console.log(r.error);
                        }
                    }
                    return 1;
                }
            }
        })
    }
};
const db = {
    exeCreate(entity, val) {
        let proc = null;
        val.db_action = 'create';
        if (isNaN(val.id) || val.id < 1) {
            proc = dbLocal.newKey(entity).then(key => {
                val.id = key
            })
        } else {
            proc = dbLocal.exeRead('sync_' + entity, val.id).then(d => {
                if ($.isEmptyObject(d) || d.db_action === 'update')
                    val.db_action = 'update'
            })
        }
        return proc.then(d => {
            return dbLocal.insert("sync_" + entity, val, parseInt(val.id)).then(idSync => {
                let action = val.db_action;
                delete (val.db_action);
                return dbLocal.exeCreate(entity, val).then(d => {
                    return dbLocal.exeRead("__react").then(react => {
                        if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                            eval(react[0][entity][action]);
                        if (AUTOSYNC) {
                            return dbRemote.sync(entity).then(d => {
                                return val.id
                            })
                        } else {
                            return val.id
                        }
                    })
                })
            })
        })
    }, exeDelete(entity, id) {
        return dbLocal.newKey(entity).then(key => {
            return dbLocal.insert("sync_" + entity, {
                'id': key,
                'delete': id,
                'db_action': 'delete'
            }, parseInt(key)).then(idSync => {
                dbLocal.exeDelete(entity, id).then(d => {
                    return dbLocal.exeRead("__react").then(react => {
                        if (typeof react !== "undefined" && typeof react[0] !== "undefined" && typeof react[0][entity] !== "undefined" && typeof react[0][entity][action] !== "undefined")
                            eval(react[0][entity][action]);
                        if (AUTOSYNC)
                            return dbRemote.sync(entity);
                        return null
                    })
                })
            })
        })
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
            tx.objectStore(entity).delete(key);
            return tx.complete
        })
    }, exeUpdate(entity, dados, key) {
        dbLocal.exeRead(entity, key).then(data => {
            for(let name in dados) {
                data[name] = dados[name];
            }
            data.id = key;
            dbLocal.exeCreate(entity, data)
        })
    }, insert(entity, val, key) {
        return dbLocal.exeRead('__dicionario', 1).then(dicionarios => {
            if (!/^__/.test(entity) && typeof dicionarios[entity] === "object") {
                for(let col in val) {
                    let v = val[col];
                    if (col !== "id")
                        val[col] = getDefaultValue(dicionarios[entity][col], v)
                }
            }
            return dbLocal.conn(entity).then(dbLocalTmp => {
                const tx = dbLocalTmp.transaction(entity, 'readwrite');
                tx.objectStore(entity).put(val, key);
                return key
            })
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