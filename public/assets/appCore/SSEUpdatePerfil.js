$(function () {
    sse.add("updatePerfil", function (data) {
        if(typeof data === "object") {
            USER = data;
            storeUser();
            _updateTemplateRealTime();
        }
    });
});