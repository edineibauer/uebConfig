<script>
    if(navigator.onLine) {
        if (senha = prompt("Senha:")) {
            toast("Atualizando Sistema...", 1000000000);
            post("config", "updateSystem", {pass: senha}, function (g) {
                if (g) {
                    localStorage.removeItem('update');
                    checkUpdate().then(() => {
                        location.href = HOME;
                    })
                } else {
                    toast("Senha inválida", 2000, "toast-warning");
                }
            })
        }
    }
</script>