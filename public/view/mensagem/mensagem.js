if (typeof host === "undefined") {
    var host = HOME.replace("https://", "").replace("http://", "").split("/")[0];
    var socket = new WebSocket('ws://' + host + ':9999/mensagem/chat');

    // AJAX.get("serverMessage");
    var writing = !1, usuario = {};

    // Ao receber mensagens do servidor
    socket.addEventListener('message', function (event) {
        if (!usuario.mensagens.bloqueado)
            showMessage(JSON.parse(event.data));
    });
}

function showMessage(mensagem) {
    if ($.trim(mensagem.mensagem).length) {
        if (mensagem.mensagem === "...writing...") {
            if (mensagem.usuario != usuario.id)
                showWriting();
        } else {
            clearTimeout(writing);
            showLastOnline();
            $('<li class="' + (mensagem.usuario == usuario.id ? "replies" : "sent") + '"><p>' + mensagem.mensagem + '<small>' + (!isEmpty(mensagem.data) ? moment(mensagem.data) : moment()).format("HH:mm") + '</small></p></li>').appendTo($('.messages ul'));
            $('.message-input input').val(null);
            $(".messages")[0].scrollTop = $(".messages")[0].scrollHeight;
        }
    }
}

function showWriting() {
    $("#perfil-status").html("digitando...");

    clearTimeout(writing);
    writing = setTimeout(function () {
        showLastOnline();
    }, 1500);
}

function sendMessage() {
    const data = {
        usuario: usuario.id,
        mensagem: $("#message-text").val(),
        data: moment().format("YYYY-MM-DD HH:mm:ss")
    };

    socket.send(JSON.stringify(data));
    AJAX.post("chatServerSendMessage", data);
    $("#message-text").val('');
}

function sendWriting() {
    const data = {
        usuario: usuario.id,
        mensagem: "...writing...",
        data: moment().format("YYYY-MM-DD HH:mm:ss")
    };

    socket.send(JSON.stringify(data));
}

async function readUser() {
    usuario = await db.exeRead("usuarios", history.state.param.url[0]);
    usuario.imagem = (!isEmpty(usuario.imagem) ? (usuario.imagem.constructor === Array && typeof usuario.imagem[0] !== "undefined" ? usuario.imagem[0].url : usuario.imagem) : HOME + "assetsPublic/img/img.png");
}

function updateDomInfo() {
    $("#mensagemHeader").htmlTemplate("mensagemHeader", usuario);
    showLastOnline();
}

function showLastOnline() {
    $("#perfil-status").html((usuario.mensagens.bloqueado ? "<i class='material-icons blocked'>block</i>" : "") + (usuario.mensagens.silenciado ? "<i class='material-icons'>volume_off</i>" : "") + (!isEmpty(usuario.mensagens.ultima_vez_online) ? moment(usuario.mensagens.ultima_vez_online) : moment()).calendar());
}

function closeModal() {
    $("#app").off("mouseup");
    $("#modalPreviewFile, #core-overlay").removeClass("active");
    $("#modalContent").html("");
}

function getContent(url, nome, type, fileType) {
    let $content = "";
    if (type === 1) {
        //imagem
        $content = "<img src='" + url + "' class='col' title='" + nome + "' alt='imagem para " + nome + "' />";
    } else if (type === 2) {
        //video
        $content = "<video height='700' controls><source src='" + url + "' type='" + fileType + "'></video>";
    } else if (type === 3) {
        //document
        $content = $("<iframe/>").attr("src", "https://docs.google.com/gview?embedded=true&url=" + url).attr("frameborder", "0").css({
            width: "100%",
            height: "99%",
            "min-height": (window.innerHeight - 200) + "px"
        });
    } else if (type === 4) {
        //audio
        $content = "<audio controls><source src='" + url + "' type='" + fileType + "'></audio>";
    }
    return $content;
}

function _resizeControl() {
    $("#modalPreviewFile").css("margin-left", ((window.innerWidth - $("#modalPreviewFile").width()) / 2) + "px");
    window.addEventListener("resize", function () {
        $("#modalPreviewFile").css("margin-left", ((window.innerWidth - $("#modalPreviewFile").width()) / 2) + "px");
    });
}

function _openPreviewFile(url, nome, name, type, fileType, preview) {
    /**
     * Overlay
     */
    $("#core-overlay").css("background-color", "rgba(0,0,0,.8)");
    $("#core-overlay, #modalPreviewFile").addClass("active");

    /**
     * Modal Content
     */
    $("#modalTitle").html((!/^image\//.test(fileType) ? preview : "") + nome);
    $("#modalContent").html(getContent(url, nome, type, fileType));
    $(".downloadModal").attr("href", url);
    if (type === 2)
        $("#modalContent video")[0].play();
    else if (type === 4)
        $("#modalContent audio")[0].play();

    /**
     * Close modal
     */
    $("#app").off("mouseup").on("mouseup", function (e) {
        if ($(".closeModal").is(e.target) || $(".closeModal > i").is(e.target) || $(".closeModal > #modalTitle").is(e.target) || $(".previewFileCard").is(e.target))
            closeModal();
    });
}

(async () => {
    /**
     * Retrieve user info
     * show user on DOM
     */
    await readUser();

    /**
     * Retrieve messages chat data
     */
    let read = new Read;
    read.setFilter({"usuario": usuario.id});
    let messageUser = await read.exeRead("messages_user");
    if (!isEmpty(messageUser) && messageUser.constructor === Array) {

        usuario.mensagens = messageUser[0];
        usuario.mensagens.status = (usuario.mensagens.bloqueado ? "<i class='material-icons blocked'>block</i>" : "") + (usuario.mensagens.silenciado ? "<i class='material-icons'>volume_off</i>" : "") + (!isEmpty(usuario.mensagens.ultima_vez_online) ? moment(usuario.mensagens.ultima_vez_online) : moment()).calendar();
        updateDomInfo();

        /**
         * Check blocked status
         */
        if (usuario.mensagens.bloqueado)
            $("#bloquear > li").html("desbloquear");

        /**
         * Check silence status
         */
        if (usuario.mensagens.silenciado)
            $("#silenciar > li").html("não silenciar");

        /**
         * Show messages on DOM
         */
        let mensagens = await db.exeRead("messages", messageUser[0].mensagem);
        $(".messages > ul").html("");
        if (!isEmpty(mensagens)) {
            for (m of mensagens.messages)
                showMessage(m);
        }
    }

    /**
     * Input text click
     */
    $("#message-text").off("keyup").on("keyup", function () {
        if (event.keyCode === 13)
            sendMessage();
        else
            sendWriting();
    });

    /**
     * Buttons click
     */
    $('.submit').click(function () {
        sendMessage();
    });

    $(".social-media").off("click").on("click", function () {
        let $menu = $("#menu-chat");
        if (!$menu.hasClass("active")) {
            $menu.addClass("active");
            $("body").off("mouseup").on("mouseup", function (e) {
                if (!$menu.is(e.target) && $menu.has(e.target).length === 0) {
                    setTimeout(function () {
                        $menu.removeClass("active");
                        $("body").off("mouseup");
                    }, 50);
                }
            })
        }
    });

    $("#silenciar").off("click").on("click", function () {
        $("#silenciar > li").html(usuario.mensagens.silenciado ? "silenciar" : "não silenciar");
        usuario.mensagens.silenciado = usuario.mensagens.silenciado == 1 ? 0 : 1;
        showLastOnline();
        $("#menu-chat").removeClass("active");
        $("body").off("mouseup");
        AJAX.post("chatSilenciar", {user: usuario.id, silenciado: usuario.mensagens.silenciado});
    });

    $("#bloquear").off("click").on("click", function () {
        $("#bloquear > li").html((usuario.mensagens.bloqueado ? "" : "des") + "bloquear");
        usuario.mensagens.bloqueado = usuario.mensagens.bloqueado == 1 ? 0 : 1;
        showLastOnline();
        $("#menu-chat").removeClass("active");
        $("body").off("mouseup");
        AJAX.post("chatBloquear", {user: usuario.id, bloqueado: usuario.mensagens.bloqueado});
    });

    /**
     * Send Anexo
     */
    let templates = await getTemplates();
    $("#anexo").off("change").on("change", async function (e) {
        if (typeof e.target.files[0] !== "undefined") {
            let upload = await AJAX.uploadFile(e.target.files);

            for (let file of upload) {
                /**
                 * Send message anexo
                 * @type {{data: *, mensagem: *, usuario: *}}
                 */
                const data = {
                    usuario: usuario.id,
                    mensagem: Mustache.render(templates.anexoCard, file),
                    data: moment().format("YYYY-MM-DD HH:mm:ss")
                };

                socket.send(JSON.stringify(data));
                await AJAX.post("chatServerSendMessage", data);
            }
        }
    });

    /**
     * Função de click nos cards
     */
    $("#app").off("click", ".modal-open").on("click", ".modal-open", function () {
        _openPreviewFile($(this).data("url"), $(this).data("nome"), $(this).data("name"), $(this).data("type"), $(this).data("filetype"), $(this).find(".preview").html());
    });

    _resizeControl();
})();