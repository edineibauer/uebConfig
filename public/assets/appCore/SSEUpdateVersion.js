$(function () {
    sse.add("updateVersion", async function (data) {
        if (!isEmpty(data) && isOnline() && SERVICEWORKER) {
            console.log(data);
            if (!localStorage.update)
                localStorage.update = data;
            else if (parseFloat(data) > parseFloat(localStorage.update))
                toast("<div class='left'>Nova versão</div><button style='float: right;border: none;outline: none;padding: 10px 20px;border-radius: 5px;margin: -5px -11px -5px 20px;background: #fff;color: #555;cursor: pointer;box-shadow: 0px 2px 5px -4px black' onclick='updateCache()'>atualizar</button>", 15000, "toast-success");
        }
    });
});