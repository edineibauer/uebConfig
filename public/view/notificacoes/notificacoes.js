$(function () {
    $(".badge-notification").remove();
    if (swRegistration && swRegistration.pushManager && typeof Notification !== "undefined" && Notification.permission === "default")
        $(".btn-notify").remove();
});