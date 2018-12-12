caches.keys().then(cacheNames => {
    return Promise.all(cacheNames.map(cacheName => {
        return caches.delete(cacheName)
    }))
});