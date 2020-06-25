/**
 * Padroniza valores nulos em Array
 * @param param
 * @returns {*}
 */
function convertEmptyArrayToNull(param) {
    if (typeof (param) === "object" && !$.isEmptyObject(param)) {
        $.each(param, function (key, value) {
            if ($.isArray(value))
                param[key] = value.length > 0 ? value : ""; else if (typeof (value) === "object")
                param[key] = !$.isEmptyObject(param) ? convertEmptyArrayToNull(value) : ""
        })
    }
    return param
}

/**
 * Deprecated
 * @param lib
 * @param file
 * @param param
 * @param funcao
 */
function post(lib, file, param, funcao) {
    if (typeof funcao === "undefined" && typeof param !== 'object') {
        funcao = param;
        param = {fileInSetFolder: file}
    } else {
        param.fileInSetFolder = file
    }
    param.maestruToken = localStorage.token;

    $.ajax({
        type: "POST", url: SERVER + 'set', data: convertEmptyArrayToNull(param), success: function (data) {
            if (data.response === 1) {
                if (typeof (funcao) !== "undefined")
                    funcao(data.data)
            } else {
                switch (data.response) {
                    case 2:
                        toast(data.error, 7000, "toast-warning");
                        break;
                    default:
                        if (data.data === "no-network")
                            toast("Sem Conexão", 500, "toast-warning");
                        else
                            toast("Caminho não encontrado", "toast-warning");
                        break
                }

                if (typeof (funcao) !== "undefined")
                    funcao((data.data === "no-network" ? "no-network" : null));
            }
        }, fail: function () {
            toast("Erro na Conexão", 3000, "toast-warning");
        }, dataType: "json"
    })
}

async function getJSON(url) {
    let home = new RegExp("^" + preg_quote(SERVER), "i");
    if(!/^http/.test(url) || home.test(url))
        url = (/\/$/.test(url) ? url.slice(0, -1) : url) + "/maestruToken/" + localStorage.token;

    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = function () {
            if (req.status === 200) {
                resolve(req.response)
            } else {
                reject(Error(req.statusText))
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"))
        };
        req.send();

    }).then(JSON.parse).catch(function (err) {
        url = url.replace(HOME, "");
        let isView = new RegExp("^view\/", "i");
        if (isView.test(url))
            location.href = HOME + "network";
        else
            toast("Sem Conexão!", 500, "toast-warning");
        throw err;
    })
}

async function get(file) {
    return getJSON(SERVER + "get/" + file).then(data => {
        if (data.response === 1) {
            return data.data;
        } else {
            switch (data.response) {
                case 2:
                    toast(data.error, 1500, "toast-warning");
                    break;
                case 3:
                    location.href = data.data;
                    break;
                case 4:
                    if (data.data !== "no-network")
                        toast("Caminho não encontrado", 6500, "toast-warning")
            }
        }
        toast("Sem Conexão!", 500, "toast-warning");
        console.log("OFFLINE: arquivo '" + file + "'");
    })
}

class AJAX {
    static async get(fileInGetFolder) {
        return get(fileInGetFolder);
    }

    static async getUrl(url) {
        return getJSON(url);
    }

    static async post(fileInSetFolder, postData) {
        return new Promise((s, f) => {
            $.ajax({
                type: "POST",
                url: SERVER + 'set',
                data: convertEmptyArrayToNull(Object.assign({
                    fileInSetFolder: fileInSetFolder,
                    maestruToken: localStorage.token
                }, postData)),
                success: function (data) {
                    if (data.response === 1) {
                        s(data.data)
                    } else {
                        switch (data.response) {
                            case 2:
                                toast(data.error, 7000, "toast-warning");
                                break;
                            default:
                                if (data.data === "no-network")
                                    toast("Sem Conexão", 500, "toast-warning");
                                else
                                    toast("Caminho não encontrado", "toast-warning");
                                break
                        }

                        f(data.data);
                    }
                },
                fail: function () {
                    toast("Erro na Conexão", 3000, "toast-warning");
                    f("no-network");
                },
                dataType: "json"
            });
        })
    }

    static async postFormData(fileInSetFolder, postData) {
        let formData = new FormData();
        formData.append("fileInSetFolder", fileInSetFolder);
        formData.append("maestruToken", localStorage.token);

        if(!isEmpty(postData)) {
            for(let i in postData) {
                if(!isEmpty(postData[i]) && postData[i].constructor === File && typeof postData[i].name === "string")
                    formData.append(i, postData[i], postData[i].name);
                else
                    formData.append(i, postData[i]);
            }
        }

        return new Promise((s, f) => {
            $.ajax({
                type: "POST",
                enctype: 'multipart/form-data',
                url: SERVER + "set/",
                xhr: function () {
                }, success: function (data) {
                    if (data.response === 1) {
                        s(data.data)
                    } else {
                        switch (data.response) {
                            case 2:
                                toast(data.error, 7000, "toast-warning");
                                break;
                            default:
                                if (data.data === "no-network")
                                    toast("Sem Conexão", 500, "toast-warning");
                                else
                                    toast("Caminho não encontrado", "toast-warning");
                                break
                        }

                        f(data.data);
                    }
                }, fail: function () {
                    toast("Erro na Conexão", 3000, "toast-warning");
                    f("no-network");
                },
                async: !0,
                data: formData,
                cache: !1,
                contentType: !1,
                processData: !1,
                timeout: 900000,
                dataType: "json"
            });
        });
    }

    static async view(view) {
        return getJSON(HOME + "view/" + view).then(data => {
            if (data.response === 1) {
                clearHeaderScrollPosition();
                return data.data;
            } else {
                switch (data.response) {
                    case 2:
                        toast(data.error, 7000, "warning");
                        break;
                    case 3:
                        location.href = data.data;
                        break;
                    case 4:
                        toast("Caminho não encontrado");
                }

                console.log(data);
                return null;
            }
        });
    }
}