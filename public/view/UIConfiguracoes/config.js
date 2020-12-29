async function menuDashboard() {
    let allow = await dbLocal.exeRead("__allow", 1);
    let info = await dbLocal.exeRead("__info", 1);
    let menu = [];
    let indice = 0;

    let $menu = $("#mySidebar");
    $menu.html("");

    for(let entity in dicionarios) {
        if (typeof info[entity] !== "undefined" && info[entity]['user'] === 3 && typeof allow !== "undefined" && typeof allow[entity] !== "undefined" && typeof allow[entity].menu !== "undefined" && allow[entity].menu && !menu.find(e => {return e.entity === entity})) {
            menu.push({
                indice: indice++,
                icon: (info[entity].icon !== "" ? info[entity].icon : "storage"),
                title: ucFirst(replaceAll(replaceAll(entity, "_", " "), "-", " ")),
                entity: entity
            });
        }
    }

    menu.sort(dynamicSort('indice'));
    for(let m of menu) {
        let result = await db.exeRead(m.entity);
        $menu.append("<a href='form-maestru/" + m.entity + (!isEmpty(result) ? "/" + result[0].id : "") + "' data-target='#config-panel'><i class='material-icons left'>" + m.icon + "</i><span class='left padding-tiny padding-left'>" + m.title + "</span></a>");
    }
}

$(function () {
    menuDashboard();
})