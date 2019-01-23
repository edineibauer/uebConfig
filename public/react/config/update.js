toast('Atualizando...', 8000, 'toast-success');
post("config", "updateConfiguracoes", function () {
    updateVersion();
});
