toast('Atualizando...', 8000, 'toast-success');
post("dev-ui", "cache/update", function () {
    post("config", "updateConfiguracoes", function () {
        updateVersion();
    });
});
