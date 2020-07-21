var mensagem = [], contato = {}, lastMessageData = null, sendRequestBuy = !1, updateMessageLoop, messageId = null,
    isCliente = !0;

function clearPage() {
    clearInterval(updateMessageLoop);
}

$("#profile-img").click(function () {
    $("#status-options").toggleClass("active");
});

$(".expand-button").click(function () {
    $("#profile").toggleClass("expanded");
    $("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function () {
    $("#profile-img").removeClass();
    $("#status-online").removeClass("active");
    $("#status-away").removeClass("active");
    $("#status-busy").removeClass("active");
    $("#status-offline").removeClass("active");
    $(this).addClass("active");

    if ($("#status-online").hasClass("active")) {
        $("#profile-img").addClass("online");
    } else if ($("#status-away").hasClass("active")) {
        $("#profile-img").addClass("away");
    } else if ($("#status-busy").hasClass("active")) {
        $("#profile-img").addClass("busy");
    } else if ($("#status-offline").hasClass("active")) {
        $("#profile-img").addClass("offline");
    } else {
        $("#profile-img").removeClass();
    }

    $("#status-options").removeClass("active");
});

function updateMessagesLoop() {
    clearInterval(updateMessageLoop);
    updateMessageLoop = null;
    updateMessageLoop = setInterval(function () {
        updateMessage();
    }, 1000);
}

function newMessage(content, sendByClient) {
    if ($.trim(content).length) {
        if (isEmpty(mensagem)) {
            mensagem = {
                profissional: contato.id,
                cliente: USER.setorData.id,
                aceitou: 0,
                pendente: 1,
                mensagens: []
            };
        }

        mensagem.mensagens.push({
            mensagem: loadMessage(content, sendByClient),
            enviada_pelo_cliente: isCliente ? "1" : "0",
            data: moment().format("YYYY-MM-DD HH:mm:ss"),
            id: Date.now() + Math.floor((Math.random() * 1000) + 1),
            columnTituloExtend: '<small class="color-gray left opacity padding-tiny radius">mensagem</small><span style="padding: 1px 5px" class="left padding-right font-medium td-textarea">' + content + '</span>',
            columnName: "mensagens",
            columnRelation: "mensagem",
            columnStatus: {column: "", have: false, value: false}
        });

        if ($(".messages").length)
            $(".messages").animate({scrollTop: $(".messages")[0].scrollHeight}, "fast");

        clearInterval(updateMessageLoop);
        db.exeCreate("mensagens", mensagem).then(r => {
            mensagem.id = parseInt(r.id);

            //ativa novamente o update das mensagens
            // updateMessagesLoop();
        });
    }
}

function loadMessage(content, sendByClient) {
    if ($.trim(content).length) {
        let type = (sendByClient && isCliente) || (!sendByClient && !isCliente) ? "replies" : "sent";
        $('<li class="' + type + '"><p>' + content + '<small>' + moment().format("HH:mm") + '</small></p></li>').appendTo($('.messages ul'));
        $('.message-input input').val(null);
    }

    return content;
}

function sendMessage() {
    newMessage($(".message-input input").val(), isCliente);
    $("#message-text").focus();
}

$('.submit').click(function () {
    sendMessage();
});

function updateMessage() {
    dbRemote.syncDownload("mensagens").then(result => {
        if (result !== 0) {
            if (messageId) {
                readMessage();
            } else {
                readAllMessages();
            }
        }
    });
}

function readMessage() {
    if (isEmpty(contato)) {

        /**
         * Lê o cliente
         */
        db.exeRead("clientes", messageId).then(perfil => {
            contato = perfil;
            let isClienteContato = contato.perfil_profissional === null;
            if (!isClienteContato)
                contato.perfil_profissional = contato.perfil_profissional[0];

            if (isClienteContato)
                contato.imagemPerfil = perfil.imagem !== null && typeof perfil.imagem !== "undefined" ? perfil.imagem[0].urls.thumb : HOME + VENDOR + "site-maocheia/public/assets/svg/account.svg";
            else
                contato.imagemPerfil = perfil.perfil_profissional.imagem_de_perfil !== null && typeof perfil.perfil_profissional.imagem_de_perfil !== "undefined" ? perfil.perfil_profissional.imagem_de_perfil[0].urls.thumb : HOME + VENDOR + "site-maocheia/public/assets/svg/account.svg";

            $("#perfil-info").html('<div class="imagem-perfil-mensagem imagem-perfil-in-mensagem" style="background-image: url(\'' + contato.imagemPerfil + '\')"></div><p>' + contato.nome + '</p>');

            /**
             * Lê as mensagens do profissional com este cliente
             */
            db.exeRead("mensagens").then(m => {
                if (!isEmpty(m)) {
                    for (let i in m) {
                        if ((!isClienteContato && parseInt(m[i].profissional) === contato.id && m[i].cliente === USER.setorData.id) || (parseInt(m[i].cliente) === contato.id && m[i].profissional === USER.setorData.id)) {
                            isCliente = m[i].cliente === USER.setorData.id;
                            mensagem = m[i];
                            $('.messages ul').html("");

                            if (isCliente || mensagem.aceitou === 1) {
                                for (let i in mensagem.mensagens)
                                    loadMessage(mensagem.mensagens[i].mensagem, mensagem.mensagens[i].enviada_pelo_cliente === "1");

                                lastMessageData = mensagem.mensagens[mensagem.mensagens.length - 1].data;

                                if ($(".messages").length)
                                    $(".messages").animate({scrollTop: $(".messages")[0].scrollHeight}, 0);

                                $(".message-input").css("display", "block");
                            }

                            if (!isCliente && mensagem.aceitou === 0) {
                                loadMessage(contato.nome + " entrou em contato com você! \n\nClique em responder abaixo", !0);
                                lastMessageData = mensagem.mensagens[mensagem.mensagens.length - 1].data;

                                if ($(".messages").length)
                                    $(".messages").animate({scrollTop: $(".messages")[0].scrollHeight}, 0);

                                $(".message-input-buy").css("display", "block");
                                $(".btn-buy").off("click").on("click", function () {
                                    if (!sendRequestBuy) {
                                        sendRequestBuy = !0;
                                        post("site-maocheia", "openMessage", {id: mensagem.id}, function (g) {
                                            sendRequestBuy = !1;
                                            if (g) {
                                                $(".message-input").css("display", "block");
                                                $(".message-input-buy").css("display", "none");
                                                USER.setorData.moedas--;

                                                $(".messages > ul > li.sent").remove();
                                                for (let i in mensagem.mensagens)
                                                    loadMessage(mensagem.mensagens[i].mensagem, mensagem.mensagens[i].enviada_pelo_cliente === "1");

                                                lastMessageData = mensagem.mensagens[mensagem.mensagens.length - 1].data;

                                                if ($(".messages").length)
                                                    $(".messages").animate({scrollTop: $(".messages")[0].scrollHeight}, 0);
                                            }
                                        });
                                    }
                                });
                            }

                            break;
                        } else {
                            $(".message-input").css("display", "block");
                        }
                    }
                } else {
                    $(".message-input").css("display", "block");
                }
            })
        });
    } else {
        /**
         * Lê as mensagens do profissional com este cliente
         */
        clearInterval(updateMessageLoop);
        db.exeRead("mensagens", mensagem.id).then(m => {
            mensagem = m;

            for (let i in mensagem.mensagens) {
                if (mensagem.mensagens[i].data > lastMessageData && ((isCliente && mensagem.mensagens[i].enviada_pelo_cliente === "0") || (!isCliente && mensagem.mensagens[i].enviada_pelo_cliente === "1")))
                    loadMessage(mensagem.mensagens[i].mensagem, mensagem.mensagens[i].enviada_pelo_cliente === "1");
            }

            lastMessageData = mensagem.mensagens[mensagem.mensagens.length - 1].data;

            if ($(".messages").length)
                $(".messages").animate({scrollTop: $(".messages")[0].scrollHeight}, "fast");

            // updateMessagesLoop();
        })
    }
}

function readAllMessages() {
    let gets = [];

    return db.exeRead("mensagens").then(mensagens => {
        for (let i in mensagens)
            mensagens[i].isProfissional = mensagens[i].profissional === USER.setorData.id;

        $(".nomessage").css("display", "block");
        if (!isEmpty(mensagens)) {
            $("#nomessage").html("");

            getTemplates().then(tpl => {
                for (let i in mensagens) {
                    mensagens[i].calendar = moment(mensagens[i].mensagens[mensagens[i].mensagens.length - 1].data).calendar().toLowerCase();
                    mensagens[i].lastMessage = (mensagens[i].mensagens.length > 0 && (mensagens[i].aceitou === 1 || !mensagens[i].isProfissional) ? mensagens[i].mensagens[mensagens[i].mensagens.length - 1].mensagem : "");
                    mensagens[i].chatId = mensagens[i].isProfissional ? mensagens[i].cliente : mensagens[i].profissional;

                    if (!mensagens[i].isProfissional) {
                        db.exeRead("clientes", parseInt(mensagens[i].chatId)).then(cliente => {
                            mensagens[i].clienteData = cliente;
                            mensagens[i].clienteData.perfil_profissional = mensagens[i].clienteData.perfil_profissional[0];
                            mensagens[i].clienteData.imagem = mensagens[i].clienteData.perfil_profissional.imagem_de_perfil !== null && typeof mensagens[i].clienteData.perfil_profissional.imagem_de_perfil !== "undefined" ? mensagens[i].clienteData.perfil_profissional.imagem_de_perfil[0].urls.thumb : HOME + VENDOR + "site-maocheia/public/assets/svg/account.svg";

                            $("#nomessage").append(Mustache.render(tpl.cardMensagens, mensagens[i]));
                        })
                    } else {
                        db.exeRead("clientes", parseInt(mensagens[i].chatId)).then(profissional => {
                            mensagens[i].clienteData = profissional;
                            mensagens[i].clienteData.imagem = mensagens[i].clienteData.imagem !== null && typeof mensagens[i].clienteData.imagem !== "undefined" ? mensagens[i].clienteData.imagem[0].urls.thumb : HOME + VENDOR + "site-maocheia/public/assets/svg/account.svg";
                            $("#nomessage").append(Mustache.render(tpl.cardMensagens, mensagens[i]));
                        })
                    }
                }
            });
        }
    });
}

async function readPeopleMessages() {
    let read = new Read;
    let messages = await read.exeRead("messages_user");

    if (!isEmpty(messages)) {
        for(let message of messages) {
            message.ultima_vez_online = (!isEmpty(message.ultima_vez_online) ? moment(message.ultima_vez_online) : moment()).calendar();
            message.usuario = await read.exeRead("usuarios", message.usuario);
            message.usuario.imagem = (!isEmpty(message.usuario.imagem) ? (message.usuario.imagem.constructor === Array && typeof message.usuario.imagem[0] !== "undefined" ? message.usuario.imagem[0].url : message.usuario.imagem ) : HOME + "assetsPublic/img/img.png");
        }
        $("#list-message").htmlTemplate("cardMessages", messages);
    } else {
        $("#list-message").htmlTemplate("notificacoesEmpty", {mensagem: "Nenhuma mensagem no momento"});
    }
}

$(function () {
    (async () => {
        await readPeopleMessages();
    })();
});