/**
 * Faz request para ler report
 * @param entity
 * @param search
 * @param filter
 * @param aggroup
 * @param soma
 * @param media
 * @param maior
 * @param menor
 * @param order
 * @param reverse
 * @param limit
 * @param offset
 * @returns {Promise<unknown>}
 */
async function reportRead(entity, search, filter, aggroup, soma, media, maior, menor, order, reverse, limit, offset) {
    order = typeof order === "string" ? order : "id";
    reverse = (typeof reverse !== "undefined" ? (reverse ? !0 : !1) : !1);
    limit = parseInt(typeof limit === "number" ? limit : (localStorage.limitGrid ? localStorage.limitGrid : 15));
    limit = limit < parseInt(localStorage.limitGrid) ? parseInt(localStorage.limitGrid) : limit;
    offset = parseInt(typeof offset === "number" ? offset : 0);

    /**
     * Se tiver mais resultados no back que não estão no front
     * Ou se tiver filtros a serem aplicados
     * Ou se não estiver trabalhando com uma base front
     * então faz a leitura online
     */
    return new Promise(function (resolve, reject) {
        AJAX.post("read/report", {
            entity: entity,
            search: search,
            filter: filter,
            order: order,
            reverse: reverse,
            limit: limit,
            offset: offset,
            aggroup: aggroup,
            soma: soma,
            media: media,
            maior: maior,
            menor: menor
        }).then(data => {
            resolve({data: data.data, length: data.total});
        }).catch(() => {
            resolve(readOffline(data, search, filter, order, reverse, limit, offset));
        });
    })
}