async function noteFuncao(note) {
    for(let n of note) {
        if(isNumberPositive(n.notificacao) && n.recebeu != 1)
            db.exeUpdate("notifications_report", {id: n.id, recebeu: 1});
    }

    return note;
}

$(async function () {
    $(".badge-notification").remove();
    if (swRegistration && swRegistration.pushManager && typeof Notification !== "undefined" && Notification.permission === "default")
        $(".btn-notify").remove();

    $("#app").off("keydown touchstart", ".notification-item").on("keydown touchstart", ".notification-item", async function () {
        db.exeUpdate("notifications_report", {id: parseInt($(this).attr("rel")), abriu: 1});
    });
});