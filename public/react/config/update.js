post("config", "updateConfiguracoes", function (g) {
    clearCache().then(() => {
        window.location.reload();
    });
});