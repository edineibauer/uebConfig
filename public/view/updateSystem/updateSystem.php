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
                        location.href = HOME + "dashboard";
                    })
                } else {
                    toast("Senha inválida", 2000, "toast-warning");
                }
            });
        }
    }
</script>