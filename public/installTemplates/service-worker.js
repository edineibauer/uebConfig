const VERSION = '';
const HOME = '';
const FAVICON = '';

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

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    exdays = typeof exdays === "undefined" ? 360 : exdays;
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}

function returnNoNetwork() {
    return caches.open('core-v' + VERSION).then(cache => {
        return cache.match(HOME + "set");
    });
}

function returnViewNoNetwork() {
    return caches.open('view-v' + VERSION).then(cache => {
        return cache.match(HOME + "view/network");
    })
}

function returnImgNoNetwork() {
    return caches.open('images-v' + VERSION).then(cache => {
        return cache.match(HOME + "assetsPublic/img/nonetwork.svg?v=" + VERSION);
    })
}

self.addEventListener('appinstalled', (evt) => {
    appInstalled = !0;
    setCookie("installAppAction", "true");
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
    let get = new RegExp("(get|app\/find|app\/search|app\/get)\/", "i");
    let set = new RegExp("set\/?$", "i");
    let app = new RegExp("(app|api)\/", "i");
    let linkExterno = new RegExp("^https*:\/\/", "i");
    let imagesEntity = new RegExp("^uploads\/", "i");
    let cacheImages = new RegExp("image\/", "i");

    if (linkExterno.test(url)) {
        e.respondWith(fetch(e.request));

    } else if (core.test(url)) {
        let cacheName = (viewJs.test(url) ? 'viewUserJs' : (fonts.test(url) ? 'fonts' : (images.test(url) ? 'images' : 'core')));
        e.respondWith(
            caches.open(cacheName + '-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    if (!response && cacheName === "viewUserJs") {
                        return caches.open('viewJs-v' + VERSION).then(cache => {
                            return cache.match(url).then(response => {
                                return response || fetch(e.request).then(networkResponse => {
                                    return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnNoNetwork());
                                }).catch(error => {
                                    return returnNoNetwork();
                                });
                            });
                        });
                    } else {
                        return response || fetch(e.request).then(networkResponse => {
                            return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnNoNetwork());
                        }).catch(error => {
                            return returnNoNetwork();
                        });
                    }
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
                    }).catch(error => {
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

                    }).catch(error => {
                        return returnNoNetwork();
                    });
                });
            })
        );

    } else if (view.test(url)) {
        let listagens = new RegExp("listagem\/\.+", "i");
        let formulario = new RegExp("formulario\/\.+", "i");

        if (listagens.test(url)) {
            url = "view/listagem";
        } else if (formulario.test(url)) {
            url = "view/formulario";
        } else {
            let urlSplited = url.split("/");
            if (urlSplited.length === 3 && !isNaN(urlSplited[2]) && urlSplited[2] > 0)
                url = "view/" + urlSplited[1];
        }

        e.respondWith(
            caches.open('viewUser-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    if (response)
                        return response;

                    return caches.open('view-v' + VERSION).then(cache => {
                        return cache.match(url).then(response => {
                            return response || fetch(e.request).then(networkResponse => {
                                return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnViewNoNetwork());
                            }).catch(error => {
                                return returnViewNoNetwork();
                            });
                        });
                    })
                });
            })
        );

    } else if (get.test(url)) {

        e.respondWith(
            caches.open('viewUserGet-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    if(response) {
                        if(navigator.onLine) {
                            fetch(e.request).then(networkResponse => {
                                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' && ["get/appFilesView", "get/currentFiles", "get/userCache", "get/appFilesViewUser", "get/load/sync", "get/templatesUser"].indexOf(url) === -1 && !/get\/event\//.test(url))
                                    cache.put(url, networkResponse.clone());
                            }).catch(() => {
                            })
                        }

                        return response;
                    } else {
                        return fetch(e.request).then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {

                                if (["get/appFilesView", "get/currentFiles", "get/userCache", "get/appFilesViewUser", "get/load/sync", "get/templatesUser"].indexOf(url) === -1 && !/get\/event\//.test(url))
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

    } else if (set.test(url) || app.test(url)) {

        e.respondWith(
            fetch(e.request).then(networkResponse => {
                return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnNoNetwork());
            }).catch(error => {
                return returnNoNetwork();
            })
        );

    } else {

        if (url === HOME || url === "/" || url === "index" || url.split('.').length === 1) {

            //PÁGINAS, DIRECT CORE INDEX CACHE OR ONLINE OR NETWORK
            e.respondWith(
                caches.open('core-v' + VERSION).then(cache => {
                    return cache.match(HOME + "index").then(response => {

                        return response || fetch("index").then(networkResponse => {
                            return (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' ? networkResponse : returnViewNoNetwork());
                        }).catch(error => {
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
                        }).catch(error => {
                            return returnViewNoNetwork();
                        });
                    });
                })
            );
        }
    }
});