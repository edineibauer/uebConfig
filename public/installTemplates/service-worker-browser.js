const HOME = '';
const SERVER = '';
var VERSION = '';
var TOKEN = "0";

function returnNoNetwork() {
    return caches.open('core-v' + VERSION).then(cache => {
        return cache.match(SERVER + "post");
    });
}

function returnViewNoNetwork() {
    return caches.open('viewUser-v' + VERSION).then(cache => {
        return cache.match(HOME + "view/network/maestruToken/" + TOKEN);
    })
}

self.addEventListener('message', function(event){
    let c = JSON.parse(event.data);
    TOKEN = c.token;
    VERSION = c.version;
});

self.addEventListener('fetch', function (e) {

    let url = e.request.url.replace(HOME, '');
    let linkExterno = new RegExp("^https*:\/\/", "i");
    let viewIndex = new RegExp("^index\.html", "i");
    let core = new RegExp("^assetsPublic\/", "i");
    let get = new RegExp("^(view|get|app|api)\/", "i");

    if (linkExterno.test(url)) {
        e.respondWith(fetch(e.request));

    } else if (viewIndex.test(url)) {
        e.respondWith(
            caches.open('core-v' + VERSION).then(cache => {
                return cache.match("index").then(response => {
                    return response || fetch(url).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }
                        return returnNoNetwork()
                    }).catch(() => {
                        return returnNoNetwork();
                    });
                });
            })
        );

    } else if (core.test(url) || get.test(url)) {
        let fonts = new RegExp("^assetsPublic\/fonts\/", "i");
        let images = new RegExp("^assetsPublic\/img\/", "i");
        let viewJs = new RegExp("^assetsPublic\/view\/", "i");

        let cacheName = (get.test(url) ? "get" : (viewJs.test(url) ? 'viewUserJs' : (fonts.test(url) ? 'fonts' : (images.test(url) ? 'images' : 'core'))));

        e.respondWith(
            caches.open(cacheName + '-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(url).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }
                        return returnNoNetwork()
                    }).catch(() => {
                        return returnNoNetwork();
                    });
                });
            })
        );

    } else {

        let cache = (url === HOME || url === "" || url === "/" || url === "index" || url.split('.').length === 1 ? "core" : "misc");

        //PÁGINAS, DIRECT CORE INDEX CACHE OR ONLINE OR NETWORK
        e.respondWith(
            caches.open(cache + '-v' + VERSION).then(cache => {
                return cache.match(e.request).then(response => {
                    return response || fetch(e.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }
                        return returnNoNetwork();
                    }).catch(() => {
                        return returnViewNoNetwork();
                    });
                });
            })
        );
    }
});