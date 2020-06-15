<script>
    if(var senha = confirm("Senha:")) {
        post("config", "updateSystem", {pass: senha}, function (g) {
            if(g) {
                location.href = "<?=HOME?>";
            } else {
                toast("Senha inválida", 2000, "toast-warning");
            }
        })
    }
</script>