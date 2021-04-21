const HOME = 'http://localhost/teste/';
var VERSION = '1.01';
var TOKEN = "0";

function returnErros(cacheControl) {
    if(cacheControl === "images") {
        return caches.open('assetsPublic-v' + VERSION).then(cache => {
            return cache.match(HOME + "assetsPublic/img/nonetwork.svg?v=" + VERSION);
        })
    }

    return caches.open('core-view-v' + VERSION).then(cache => {
        return cache.match("network");
    })
}

self.addEventListener('message', function(event){
    let c = JSON.parse(event.data);
    TOKEN = c.token;
    VERSION = c.version;
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        fetch(HOME + "get/openPush/" + event.notification.tag).then(() => {
            clients.openWindow(event.notification.data)
        })
    );
});

self.addEventListener('fetch', function (e) {

    let url = e.request.url.replace(HOME, '');

    let assetsPublic = new RegExp("^assetsPublic\/", "i");
    let view = new RegExp("^view\/", "i");
    let onlyOnline = new RegExp("^(https*:\/\/|get\/|post|app\/|api\/)", "i");
    let isFileAccess = new RegExp("^((.+)\\.([a-zA-Z]{2,4})(\\?v=([0-9.])+)*)$", "igm");

    if (onlyOnline.test(url)) {

        /**
         * Sem cache, online apenas,
         * caso não tenha conexão retorna network error
         * */
        e.respondWith(
            fetch(e.request).then(networkResponse => {
                return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnErros("view"));
            }).catch(() => {
                return returnErros("view");
            })
        );

    } else if(!assetsPublic.test(url) && !view.test(url) && !isFileAccess.test(url)) {

        /**
         * Index app
         * retorna apenas cacheou network error
         * */
        e.respondWith(
            caches.open('index-v' + VERSION).then(cache => {
                return cache.match("index").then(response => {
                    return response || returnErros("view");
                }).catch(() => {
                    return returnErros("view");
                });
            })
        );

    } else {

        /**
         * Primeiro cache, depois online, depois cache
         * */

        let cacheControl = "core-assets";

        if(assetsPublic.test(url)) {
            cacheControl = 'assetsPublic';
        } else if(view.test(url)) {
            cacheControl = "user-view";
        }

        e.respondWith(
            caches.open(cacheControl + '-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(e.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }
                        return returnErros(cacheControl = "core-assets" ? "images" : "view");
                    }).catch(() => {
                        return returnErros(cacheControl = "core-assets" ? "images" : "view");
                    });
                });
            })
        );
    }
});