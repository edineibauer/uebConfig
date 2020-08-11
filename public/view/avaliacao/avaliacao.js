if (USER.id == URL[0]) {
    $("#avaliacao").remove();
    toast("Você não pode avaliar seu próprio perfil", "toast-info", 3000);
    history.back();

} else {
    db.exeRead("avaliacao", {"usuario": URL[0]}).then(result => {
        console.log(result);
        if (!isEmpty(result)) {
            //show my preview review
            $("#revision").html("Você esta revisando sua avaliação");
            $("#comentario").val(result[0].comentario);
            for(let i=1;i<=result[0].avaliacao;i++)
                $("#at-cm-star-" + i).prop("checked", !0);

        } else {
            if (!isNumberPositive(URL[0])) {
                toast("Opss! ID de usuário inválido", "toast-error", 1500);
                pageTransition("404");
            }
        }
    });

    $("#app").off("click", "#enviar").on("click", "#enviar", function () {
        let dados = {
            "avaliacao": parseInt($('input[name=at]:checked').val()),
            "comentario": $("#comentario").val(),
            "usuario": URL[0],
            "data": dateTimeFormat(),
            "nome": USER.nome,
            "imagem": (!isEmpty(USER.imagem) ? USER.imagem.url : "")
        };

        if (isEmpty(dados.avaliacao) || !isNumberPositive(dados.avaliacao)) {
            toast("Avalie o Usuário", 2000, "toast-infor");
        } else {
            db.exeCreate("avaliacao", dados).then(r => {
                if(r.db_errorback === 0) {
                    toast("Usuário Avaliado! Obrigado", "toast-success", 2500);
                    setTimeout(function () {
                        history.back();
                    }, 700);
                } else {
                    toast("Opss! Houve um erro.", "toast-error", 2500);
                }
            })
        }
    });
}