<script>
    if(navigator.onLine) {
        if (senha = prompt("Senha:")) {
            toast("Atualizando Sistema...", 1000000000);
            AJAX.post("updateSystem", {pass: senha}).then(g => {
                if(g) {
                    if(typeof sseSource !== "undefined" && navigator.onLine && typeof (EventSource) !== "undefined")
                        sseSource.close();

                    localStorage.removeItem('update');
                    checkUpdate().then(() => {
                        location.href = HOME + (HOME !== SERVER ? "index.html?url=" : "");
                    })
                } else {
                    toast("Senha inválida", 2000, "toast-warning");
                }
            }).catch(() => {toast("sem conexão")});
        }
    }
</script>