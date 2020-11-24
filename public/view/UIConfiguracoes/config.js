function hide_sidebar_small() {
    if (screen.width < 993) {
        $("#myOverlay, #mySidebar").css("display", "none")
    }
}

function mainLoading() {
    hide_sidebar_small();
    closeSidebar()
}

async function menuDashboard() {
    let allow = await dbLocal.exeRead("__allow", 1);
    let info = await dbLocal.exeRead("__info", 1);
    let templates = await getTemplates();
    let menu = [];
    let indice = 0;

    for(let entity in dicionarios) {
        if (typeof info[entity] !== "undefined" && info[entity]['user'] === 3 && typeof allow !== "undefined" && typeof allow[entity] !== "undefined" && typeof allow[entity].menu !== "undefined" && allow[entity].menu) {
            menu.push({
                indice: indice++,
                icon: (info[entity].icon !== "" ? info[entity].icon : "storage"),
                title: ucFirst(replaceAll(replaceAll(entity, "_", " "), "-", " ")),
                table: !0,
                link: !1,
                form: !1,
                page: !1,
                file: '',
                lib: '',
                entity: entity
            });
        }
    }

    menu.sort(dynamicSort('indice'));

    let tpl = (menu.length < 4 ? templates.menuCard : templates.menuLi);
    $("#config-menu").html("");
    for(let m of menu)
        $("#config-menu").append(Mustache.render(tpl, m));
}

$(function () {
    menuDashboard();

    $("body").off("click", ".menu-li:not(.not-menu-li)").on("click", ".menu-li:not(.not-menu-li)", function () {
        if ($(this).hasAttr("data-action")) {
            let action = $(this).attr("data-action");
            checkUpdate();
            mainLoading();

            if (action === "table") {
                (async () => {
                    let entity = $(this).data("entity");
                    let result = await db.exeRead(entity, null, 1);
                    let id = (!isEmpty(result) ? result[0].id : null);
                    pageTransition(entity, 'form', 'forward', "#dashboard", {id: id});
                })();

            } else if (action === 'form') {
                // let fields = (typeof $(this).attr("data-fields") !== "undefined" ? JSON.parse($(this).attr("data-fields")) : "undefined");
                let id = !isNaN($(this).attr("data-atributo")) && $(this).attr("data-atributo") > 0 ? parseInt($(this).attr("data-atributo")) : null;
                pageTransition($(this).data("entity"), 'form', 'forward', "#dashboard", id);

            } else if (action === 'page') {

                pageTransition($(this).attr("data-atributo"), 'route', 'forward', "#core-content");
            }
        }
    });
})