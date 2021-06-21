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
        type: "POST", url: SERVER + 'post', data: convertEmptyArrayToNull(param), success: function (data) {
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
    url = (/\/$/.test(url) ? url.slice(0, -1) : url);

    if((!/^http/.test(url) || home.test(url)) && !(HOME === "" && HOME !== SERVER && ["get/" + USER.setor + "/appFilesView.json", "get/" + USER.setor + "/appFilesViewUser.json", "get/" + USER.setor + "/currentFiles.json", "get/" + USER.setor + "/userCache.json"].indexOf(url) > -1))
        url += "/maestruToken/" + localStorage.token;

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
            location.href = HOME + (HOME !== SERVER ? "index.html?url=" : "") + "network";
        throw err;
    })
}

async function get(file, errorControl) {
    let url = SERVER + "get/" + file;

    if(HOME === "" && HOME !== SERVER && ["appFilesView", "appFilesViewUser", "currentFiles", "userCache"].indexOf(file) > -1)
        url = "get/" + USER.setor + "/" + file + ".json";

    return getJSON(url).then(data => {
        if (data.response === 1) {
            return data.data;
        } else {
            switch (data.response) {
                case 2:
                    if(typeof errorControl === "undefined")
                        toast(data.error, 1500, "toast-warning");

                    throw data.error;
                case 3:
                    location.href = data.data;
                    break;
                case 4:
                    if (data.data !== "no-network")
                        toast("Caminho não encontrado", 6500, "toast-warning")
            }
        }
        console.log("OFFLINE: arquivo '" + file + "'");
    })
}

/**
 * Otimize image
 * @param file
 * @param MAX_WIDTH
 * @param MAX_HEIGHT
 * @param format
 * @private
 */
async function _compressImage(file, MAX_WIDTH, MAX_HEIGHT, format) {
    return new Promise((s, f) => {
        var img = document.createElement("img");
        var reader = new FileReader();
        reader.onload = function (e) {
            if (e.target.error != null) {
                console.error("File could not be read! Code " + e.target.error.code);
                f("File could not be read!");
            } else {
                img.src = e.target.result;
                img.onload = function () {
                    let canvas = document.createElement("canvas");
                    let ctx = canvas.getContext("2d");
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH
                        }
                    } else if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    s(canvas.toDataURL("image/" + format));
                }
            }
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Create a object file from a mock
 * @param mock
 * @returns {Promise<*>}
 * @private
 */
async function _createObjectFile(mock) {
    delete(mock.file);
    let dateNow = new Date();

    mock.format = {
        isImage: /^image\//.test(mock.fileType),
        isVideo: /^video\//.test(mock.fileType),
        isAudio: /^audio\//.test(mock.fileType),
        isDoc: ["txt", "doc", "docx", "dot", "dotx", "dotm", "ppt", "pptx", "pps", "potm", "potx", "pdf", "xls", "xlsx", "xltx", "rtf", "html", "css", "scss", "js", "tpl", "mustache", "json", "xml", "md", "sql", "dll"].indexOf(mock.type) > -1
    };
    mock.format.type = mock.format.isImage ? 1 : (mock.format.isVideo ? 2 : (mock.format.isDoc ? 3 : (mock.format.isAudio ? 4 : 5)));
    mock.format.isDownload = mock.format.type === 5;
    mock.shortname = mock.name.substring(0, 20) + "." + mock.type;
    mock.nome = replaceAll(replaceAll(mock.name, '-', ' '), '_', ' ');
    mock.icon = (!mock.format.isImage && ["doc", "docx", "pdf", "xls", "xlsx", "ppt", "pptx", "zip", "rar", "search", "txt", "json", "js", "iso", "css", "html", "xml", "mp3", "csv", "psd", "mp4", "svg", "avi"].indexOf(mock.type) > -1 ? mock.type : "file");
    mock.sizeName = (mock.size > 999999 ? parseFloat(mock.size / 1000000).toFixed(1) + "MB" : (mock.size > 999 ? parseInt(mock.size / 1000) + "KB" : mock.size));
    mock.data = zeroEsquerda(dateNow.getHours()) + ":" + zeroEsquerda(dateNow.getMinutes()) + ", " + zeroEsquerda(dateNow.getDay()) + "/" + zeroEsquerda(dateNow.getMonth()) + "/" + dateNow.getFullYear();

    return mock;
}

/**
 * Create a object with upload data content
 * @param resource
 * @param name
 * @param extensao
 * @param type
 * @param size
 * @returns {{file: File, size: *, name: *, type: *, fileType: *}}
 * @private
 */
function _createMock(resource, name, extensao, type, size) {
    return {
        name: name,
        type: extensao,
        fileType: type,
        size: size,
        error: "",
        file: _dataURLtoFile(resource, name + "." + type)
    };
}

function _dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--)
        u8arr[n] = bstr.charCodeAt(n);

    return new File([u8arr], filename, {type: mime})
}

/**
 * Send a post request formData
 * @param formData
 * @returns {Promise<unknown>}
 * @private
 */
async function _postFormData(formData) {
    return new Promise((s, f) => {
        $.ajax({
            type: "POST",
            enctype: 'multipart/form-data',
            url: SERVER + "post",
            success: function(data) {
                s(_postReturnData(data))
            },
            fail: function () {
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

/**
 * Work with the return data from post request
 * @param data
 * @returns {Promise<void>}
 */
async function _postReturnData(data) {
    return new Promise((s, f) => {
        if(!isEmpty(data.error))
            toast(data.error, 3000, "toast-error");

        if (data.response !== 1) {
            if (data.data === "no-network")
                toast("Sem Conexão", 500, "toast-warning");

            f(data.data);
        } else {
            s(data.data);
        }
    });
}

class AJAX {
    static async get(fileInGetFolder, errorControl) {
        return get(fileInGetFolder, errorControl);
    }

    static async getUrl(url) {
        return getJSON(url);
    }

    static async post(fileInSetFolder, postData) {
        return new Promise((s, f) => {
            if(navigator.onLine) {
                $.ajax({
                    type: "POST",
                    url: SERVER + 'post',
                    data: convertEmptyArrayToNull(Object.assign({
                        fileInSetFolder: fileInSetFolder,
                        maestruToken: localStorage.token
                    }, postData)),
                    success: function (data) {
                        _postReturnData(data).then(d => {
                            s(d);
                        }).catch(e => {
                            f(e);
                        });
                    },
                    error: function () {
                        f("no-network");
                    },
                    dataType: "json"
                });
            } else {
                f("no-network");
            }
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

        return _postFormData(formData);
    }

    static async uploadFile(file) {
        if (typeof file !== "undefined" && file !== null) {

            /**
             * Have a file, turn it to a mock object
             */
            if (file.constructor === File && typeof file.name === "string") {

                let nameSplited = file.name.split(".");
                let extensao = nameSplited.pop().toLowerCase();
                let name = nameSplited.join('-');
                name = slug(name);

                /**
                 * Work with images, otimize size
                 */
                if (/^image\//.test(file.type) && extensao !== "svg") {
                    let resource = await _compressImage(file, 1920, 1080, extensao);
                    var size = parseFloat(4 * Math.ceil(((resource.length - 'data:image/png;base64,'.length) / 3)) * 0.5624896334383812).toFixed(1);
                    return AJAX.uploadFile(_createMock(resource, name, extensao, file.type, size));
                } else {

                    /**
                     * Work with another file type
                     */
                    if (navigator.onLine || file.size < 4096000) {
                        return new Promise((s, f) => {
                            let reader = new FileReader();
                            reader.readAsDataURL(file);
                            reader.onloadend = function (event) {
                                if (event.target.error === null)
                                    s(AJAX.uploadFile(_createMock(event.target.result, name, extensao, file.type, file.size)));
                                else
                                    s({error: "Arquivo não pode ser lido! Código " + event.target.error.code});
                            }
                        });
                    } else {
                        return {error: "Arquivos maiores que 4MB só podem ser enviados online."};
                        toast("Arquivos maiores que 4MB só podem ser enviados online.", 5000, "toast-warning")
                    }
                }

                /**
                 * Have a mock object
                 */
            } else if (file.constructor === Object) {
                if(typeof file.name === "string") {
                    let formData = new FormData();
                    formData.append("fileInSetFolder", "up/source");
                    formData.append("maestruToken", localStorage.token);
                    formData.append("name", file.name);
                    formData.append("fileType", file.fileType);
                    formData.append("type", file.type);
                    formData.append("upload", file.file, file.file.name);

                    let upload = await _postFormData(formData);

                    return _createObjectFile(Object.assign({}, file, upload));
                } else if(typeof file.error === "string" && !isEmpty(file.error)) {
                    return file;
                }

                /**
                 * Have a array of Files
                 */
            } else if (file.constructor === FileList) {
                let list = [];
                for (let f of file)
                    list.push(await AJAX.uploadFile(f));

                return list;
            }

            return {error: "Arquivo enviado não é um File ou FileList"};

        } else {
            return {error: "parâmetro não definido em AJAX.uploadFile"};
        }
    }

    static async view(view) {
        let isViewBundle = HOME === "" && SERVER !== "";
        let originalView = (/\/$/.test(view) ? view.slice(0, -1) : view);

        let url = (isViewBundle ? "view/" + USER.setor + "/" + originalView + ".json" : SERVER + "view/" + originalView) + ($("head").css("font-size") === "0px" ? "" : "/oldCss");
        let home = new RegExp("^" + preg_quote(SERVER), "i");
        if(!isViewBundle && (!/^http/.test(url) || home.test(url)))
            url += "/maestruToken/" + localStorage.token;

        return new Promise(function (s, f) {
            var req = new XMLHttpRequest();
            req.open('GET', url);
            req.onload = function () {
                if (req.status === 200) {
                    let data = JSON.parse(req.response);
                    if(data.response === 1)
                        s(data.data)
                    else
                        f(Error("Response !== 1"));
                } else {
                    f(Error(req.statusText))
                }
            };
            req.onerror = function () {
                f(Error("Network Error"))
            };
            req.send();

        }).catch(function (err) {
            console.log(err);
            return (originalView !== "network" ? AJAX.view("network") : "");
        });
    }
}