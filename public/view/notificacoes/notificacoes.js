/**
 * Obtem as notificações
 * @returns {Promise<[]>}
 */
async function getNotifications() {
    let notifications = await db.exeRead("notifications_report");

    let myNotifications = [];
    if (!isEmpty(notifications)) {
        for (let note of notifications) {
            let notify = await db.exeRead("notifications", note.notificacao);
            let data = note.data_de_envio;

            if(/T/.test(note.data_de_envio))
                data = note.data_de_envio.split("T");
            else if(/\s/.test(note.data_de_envio))
                data = note.data_de_envio.split(" ");
            else
                data = [data, "00:00:00"];

            let hora = data[1].split(":");
            hora = hora[0] + ":" + hora[1];
            data = data[0].split("-");
            data = data[2] + "/" + data[1] + "/" + data[0];
            notify.data = hora + "\n" + data;

            notify.imagem = notify.imagem || HOME + "assetsPublic/img/favicon-256.png";
            note.notificacaoData = notify;
            myNotifications.push(note);
        }
    }

    return myNotifications.reverse();
}

$(function () {
    if (swRegistration && swRegistration.pushManager && typeof Notification !== "undefined" && Notification.permission === "default")
        $(".btn-notify").remove();

    $(".badge-notification").remove();

    (async () => {
        let myNotifications = await getNotifications();

        if (isEmpty(myNotifications))
            $("#notificacoes").htmlTemplate('notificacoesEmpty');
        else
            $("#notificacoes").htmlTemplate('note', myNotifications);

        for(let note of myNotifications) {
            if (note.recebeu === 0)
                db.exeCreate("notifications_report", {id: note.id, recebeu: 1});
        }
    })();
});