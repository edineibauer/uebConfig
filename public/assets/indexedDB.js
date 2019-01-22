const dbRemote = {
    sync(entity) {
        if (typeof entity === "string") {
            return dbRemote.syncDownload(entity).then(d => {
                return dbRemote.syncUpdate(entity).then(haveUpdates => {
                    if (haveUpdates)
                        dbRemote.syncPost(entity)
                })
            })
        } else if (typeof entity === "undefined") {
            dbLocal.exeRead('__dicionario', 1).then(dicionarios => {
                $.each(dicionarios.dicionario, function (e, f) {
                    if (typeof f === "object" && typeof e === "string")
                        dbRemote.sync(e)
                })
            })
        } else if (typeof entity === "object" && $.isArray(entity)) {
            $.each(entity, function (i, e) {
                dbRemote.sync(e)
            })
        }
    }, syncDownload(entity) {
        return dbLocal.exeRead('__historic', 1).then(hist => {
            var down = false;
            $.ajax({
                type: "POST",
                url: HOME + 'set',
                data: convertEmptyArrayToNull({
                    lib: 'entity',
                    file: 'load/entity',
                    entity: entity,
                    historic: hist[entity] || null
                }),
                success: function (data) {
                    if (data.response === 1 && !$.isEmptyObject(data.data) && typeof data.data.js === "undefined") {
                        if (data.data.historic !== 0) {
                            dbLocal.clear(entity);
                            $.each(data.data.data, function (i, val) {
                                val.id = parseInt(val.id);
                                dbLocal.exeCreate(entity, val)
                            });
                            hist.id = 1;
                            hist[entity] = data.data.historic;
                            dbLocal.exeCreate('__historic', hist);
                            down = true;
                        }
                    }
                },
                async: !1,
                dataType: "json"
            });
            return down;
        })
    }, syncUpdate(entity) {
        return dbLocal.exeRead('sync_' + entity).then(dados => {
            if (dados.length) {
                $.each(dados, function (i, d) {
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
                });
                return 1
            }
            return 0
        })
    }, syncPost(entity) {
        dbLocal.exeRead('sync_' + entity).then(dadosSync => {
            if (dadosSync.length) {
                $.each(dadosSync, function (si, dados) {
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
                                    r = data.data;
                            },
                            async: false,
                            dataType: "json"
                        });
                    }

                    if (r) {
                        if(r.data !== 0 && r.error === 0) {
                            dbLocal.exeDelete('sync_' + entity, syncId);
                            dbLocal.exeCreate(entity, r.data);
                            dbLocal.exeRead("__historic", 1).then(hist => {
                                hist[entity] = r.historic;
                                hist[entity].id = 1;
                                dbLocal.exeCreate("__historic", hist)
                            });
                        } else if(r.error !== 0){
                            toast("Servidor não validou o formulário");
                            console.log(r.error);
                        }
                    }
                })
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
                        if (typeof react.react !== "undefined" && typeof react.react[entity] !== "undefined" && typeof react.react[entity][action] !== "undefined")
                            $.cachedScript(react.react[entity][action]);
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
                        if (typeof react.react[entity] !== "undefined" && typeof react.react[entity]['delete'] !== "undefined")
                            $.cachedScript(react.react[entity]['delete']);
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
            if(!isNaN(val.id) && val.id > 0)
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
            $.each(dados, function (name, value) {
                data[name] = value
            });
            data.id = key;
            dbLocal.exeCreate(entity, data)
        })
    }, insert(entity, val, key) {
        return dbLocal.exeRead('__dicionario', 1).then(dicionarios => {
            if (!/^__/.test(entity) && typeof dicionarios.dicionario[entity] === "object") {
                $.each(val, function (col, v) {
                    if (col !== "id")
                        val[col] = getDefaultValue(dicionarios.dicionario[entity][col], v)
                })
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
};