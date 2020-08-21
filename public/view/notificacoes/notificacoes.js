$(async function () {
    $(".badge-notification").remove();
    if (swRegistration && swRegistration.pushManager && typeof Notification !== "undefined" && Notification.permission === "default")
        $(".btn-notify").remove();

    let note = await dbLocal.exeRead("notifications_report");
    if(!isEmpty(note)) {
        for(let n of note)
            db.exeUpdate("notifications_report", {id: n.id, recebeu: 1});
    }

    $("#app").off("keydown touchstart", ".notification-item").on("keydown touchstart", ".notification-item", async function () {
        let note = await dbLocal.exeRead("notifications_report", $(this).attr("rel"));
        if(!isEmpty(note))
            db.exeUpdate("notifications_report", {id: note.id, abriu: 1});
    });
});