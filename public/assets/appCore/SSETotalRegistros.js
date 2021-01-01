$(function () {
    sse.add("totalRegistros", async function (data) {
        if (!isEmpty(data)) {
            await dbLocal.exeCreate("__totalRegisters", data);

            if(typeof grids !== "undefined")
                Object.values(grids)[0].updateTotalTable();
        }
    });
});