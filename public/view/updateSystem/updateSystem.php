<script>
    if(navigator.onLine) {
        if (senha = prompt("Senha:")) {
            toast("Atualizando Sistema...", 100000);
            post("config", "updateSystem", {pass: senha}, function (g) {
                if (g) {
                    location.href = "<?=HOME?>";
                } else {
                    toast("Senha inválida", 2000, "toast-warning");
                }
            })
        }
    }
</script>