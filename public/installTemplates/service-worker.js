const VERSION = '';
const HOME = '';
const FAVICON = '';
const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test( userAgent );
};
const isInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);
var appInstalled = !1;
var deferredPrompt;

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

function acceptInstallApp() {
    if (!appInstalled) {
        closeInstallAppPrompt(1);
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then(choiceResult => {
            appInstalled = choiceResult.outcome === 'accepted';
            setCookie("installAppAction", appInstalled);
            if(appInstalled)
                post("config", "appInstaled", {success: !0, ios: isIos()});
            else
                post("config", "appInstaled", {success: !1, ios: isIos()});
        });
    }
}

function closeInstallAppPrompt(onInstall) {
    let $installCard = $("#installAppCard").addClass("activeClose");
    $("#core-overlay").removeClass("active activeBold");
    setCookie("installAppAction", "false");
    post("config", "appInstaledPrompt", {success: typeof onInstall !== "undefined", ios: isIos()});

    setTimeout(function () {
        $installCard.remove();
    }, 300);
}

function openInstallAppPrompt(force) {
    if (!appInstalled && !isInStandaloneMode()) {
        if((typeof force === "boolean" && force) || getCookie("installAppAction") === "") {
            getTemplates().then(tpl => {
                $("#core-overlay").addClass("active activeBold");
                $("#app").append(Mustache.render((isIos() ? tpl.installAppCard : tpl.installAppCard), {
                    home: HOME,
                    favicon: FAVICON,
                    sitename: SITENAME,
                    nome: USER.nome
                }));
            });
        }
    }
}

self.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

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
    options.badge = options.badge || (HOME + FAVICON);
    options.icon = options.icon || (HOME + FAVICON);
    options.data = options.data || HOME;

    if (typeof title === "string" && title.length > 2)
        event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});

self.addEventListener('fetch', function (e) {

    let url = e.request.url.replace(HOME, '');
    let fonts = new RegExp("assetsPublic\/fonts\/", "i");
    let images = new RegExp("assetsPublic\/img\/", "i");
    let viewJs = new RegExp("assetsPublic\/view\/\.+.min.js", "i");
    let viewCss = new RegExp("assetsPublic\/view\/\.+.min.css", "i");
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
        let cacheName = (viewJs.test(url) ? 'viewUserJs' : (viewCss.test(url) ? 'viewUserCss' : (fonts.test(url) ? 'fonts' : (images.test(url) ? 'images' : 'core'))));
        e.respondWith(
            caches.open(cacheName + '-v' + VERSION).then(cache => {
                return cache.match(url).then(response => {
                    if (!response && (cacheName === "viewUserJs" || cacheName === "viewUserCss")) {
                        return caches.open(cacheName.replace("User", "") + '-v' + VERSION).then(cache => {
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

        if (listagens.test(url))
            url = HOME + "view/listagem";
        else if (formulario.test(url))
            url = HOME + "view/formulario";

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
                    return response || fetch(e.request).then(networkResponse => {
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            cache.put(url, networkResponse.clone());
                            return networkResponse;
                        }

                        return returnNoNetwork();
                    }).catch(error => {
                        return returnNoNetwork();
                    })
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