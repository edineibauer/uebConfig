$(function () {
    sse.add("totalRegistros", function (data) {
        if (!isEmpty(data))
            dbLocal.exeCreate("__totalRegisters", data);
    });
});