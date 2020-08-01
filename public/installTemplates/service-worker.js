const HOME = '';
var VERSION = '';
var TOKEN = "0";

function isJson(str) {
    if (typeof str !== "string")
        return !1;
    try {
        if (typeof JSON.parse(str) !== "object")
            return !1
    } catch (e) {
        return !1
    }
    return !0
}

function returnNoNetwork() {
    return caches.open('core-v' + VERSION).then(cache => {
        return cache.match(HOME + "post");
    });
}

function returnViewNoNetwork() {
    return caches.open('viewUser-v' + VERSION).then(cache => {
        return cache.match(HOME + "view/network/maestruToken/" + TOKEN);
    })
}

function returnImgNoNetwork() {
    return caches.open('images-v' + VERSION).then(cache => {
        return cache.match(HOME + "assetsPublic/img/nonetwork.svg?v=" + VERSION);
    })
}

self.addEventListener('message', function(event){
    let c = JSON.parse(event.data);
    TOKEN = c.token;
    VERSION = c.version;
});

self.addEventListener('appinstalled', (evt) => {
    localStorage.installAppAction = 1;
});

self.addEventListener('push', function (event) {
    let title = "";
    let options = {};
    if (isJson(event.data.text())) {
        options = JSON.parse(event.data.text());
        title = options.title;
        delete options.title;
    } else {
        title = event.data.text();
    }
    options.badge = options.badge || (HOME + "assetsPublic/img/favicon.png?v=" + VERSION);
    options.icon = options.icon || (HOME + "assetsPublic/img/favicon.png?v=" + VERSION);
    options.data = options.data || HOME;
    options.tag = options.id || "";

    if (typeof title === "string" && title.length > 2) {
        event.waitUntil(
            fetch(HOME + "get/receivePush/" + options.id).then(() => {
                self.registration.showNotification(title, options)
            })
        );
    }
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
    let fonts = new RegExp("assetsPublic\/fonts\/", "i");
    let images = new RegExp("assetsPublic\/img\/", "i");
    let viewJs = new RegExp("assetsPublic\/view\/", "i");
    let core = new RegExp("assetsPublic\/", "i");
    let view = new RegExp("view\/", "i");
    let getStatic = new RegExp("get\/static\/", "i");
    let get = new RegExp("(get|app\/find|app\/search|app\/get)\/", "i");
    let set = new RegExp("post\/?$", "i");
    let app = new RegExp("(app|api)\/", "i");
    let linkExterno = new RegExp("^https*:\/\/", "i");
    let imagesEntity = new RegExp("uploads\/form\/", "i");
    let cacheImages = new RegExp(".(png|jpg|jpeg|svg|gif|webp)$", "i");

    if (linkExterno.test(url)) {
        e.respondWith(fetch(e.request));

    } else if (core.test(url)) {
        let cacheName = (viewJs.test(url) ? 'viewUserJs' : (fonts.test(url) ? 'fonts' : (images.test(url) ? 'images' : 'core')));
        e.respondWith(
            caches.open(cacheName + '-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(e.request).then(networkResponse => {
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

    } else if (imagesEntity.test(url)) {
        e.respondWith(
            caches.open('viewUserImages-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(e.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }

                        return returnImgNoNetwork();
                    }).catch(() => {
                        return returnImgNoNetwork();
                    })
                })
            })
        );

    } else if (cacheImages.test(url)) {
        e.respondWith(
            caches.open('cacheImage-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(e.request).then(networkResponse => {

                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }

                        return returnNoNetwork();

                    }).catch(() => {
                        return returnNoNetwork();
                    });
                });
            })
        );

    } else if (view.test(url)) {
        e.respondWith(
            caches.open('viewUser-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    return response || fetch(e.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }

                        return returnViewNoNetwork();
                    }).catch(() => {
                        return returnViewNoNetwork();
                    });
                });
            })
        );

    } else if (getStatic.test(url)) {
        e.respondWith(
            caches.open('viewUserGet-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    if(response) {
                        if(navigator.onLine) {
                            return fetch(e.request).then(networkResponse => {
                                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic')
                                    cache.put(url, networkResponse.clone());

                                return networkResponse;
                            }).catch(() => {
                                return returnNoNetwork();
                            })
                        }

                        return response;
                    } else {
                        return fetch(e.request).then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                    cache.put(url, networkResponse.clone());

                                return networkResponse;
                            }

                            return returnNoNetwork();
                        }).catch(() => {
                            return returnNoNetwork();
                        })
                    }
                })
            })
        );

    } else if (get.test(url) || set.test(url) || app.test(url)) {

        e.respondWith(
            fetch(e.request).then(networkResponse => {
                return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnNoNetwork());
            }).catch(() => {
                return returnNoNetwork();
            })
        );

    } else {

        if (url === HOME || url === "" || url === "/" || url === "index" || url.split('.').length === 1) {

            //PÁGINAS, DIRECT CORE INDEX CACHE OR ONLINE OR NETWORK
            e.respondWith(
                caches.open('core-v' + VERSION).then(cache => {
                    return cache.match(HOME + "index").then(response => {

                        return response || fetch("index").then(networkResponse => {
                            return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnViewNoNetwork());
                        }).catch(() => {
                            return returnViewNoNetwork();
                        });
                    });
                })
            );

        } else {

            e.respondWith(
                caches.open("misc-v" + VERSION).then(cache => {
                    return cache.match(url).then(response => {

                        return response || fetch(e.request).then(networkResponse => {
                            return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnViewNoNetwork());
                        }).catch(() => {
                            return returnViewNoNetwork();
                        });
                    });
                })
            );
        }
    }
});