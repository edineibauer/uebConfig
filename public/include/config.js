
//delete service workers
if(navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister()
        }
    });
}

//delete caches
caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
        return caches.delete(cacheName)
    }))
});