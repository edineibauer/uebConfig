<script>
    if(senha = prompt("Senha:")) {
        post("config", "updateSystem", {pass: senha}, function (g) {
            if(g) {
                location.href = "<?=HOME?>";
            } else {
                toast("Senha inválida", 2000, "toast-warning");
            }
        })
    }
</script>