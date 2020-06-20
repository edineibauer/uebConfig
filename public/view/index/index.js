(async() => {
    let tpl = await getTemplates();

    /**
     * Waves
     */
    $("#core-content").after(Mustache.render(tpl.wavesBottom));

    let cards = [];
    cards.push({
        title: "Acessar",
        description: "comece a desenvolver",
        image: HOME + VENDOR + "config/public/assets/img/back3.jpg",
        url: "login"
    });
    cards.push({
        title: "Explorar",
        description: "aprenda com tutoriais",
        image: HOME + VENDOR + "config/public/assets/img/back1.png",
        url: "tutorial-maestru"
    });

    for(let card of cards)
        $("#home-card").append(Mustache.render(tpl.cardMovie, card));
})();
