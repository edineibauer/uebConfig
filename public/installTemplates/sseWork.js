var SERVER = 'http://localhost/ecash/', sseEvent = null, ports = [];

self.addEventListener("connect", function (e) {
    let port = e.ports[0];
    port.addEventListener("message", function (e) {
        startSSE(e.data);
    }, false);

    port.start();
    ports.push(port);
}, false);

function postToAll(message, type) {
    ports.forEach(port => port.postMessage(JSON.stringify({data: message, type: type})));
}

function startSSE(token) {
    if(!sseEvent) {
        sseEvent = new EventSource(SERVER + "get/sseEngineEvent/maestruToken/" + token, {withCredentials: true});

        sseEvent.addEventListener('base', async function (e) {
            postToAll(JSON.parse(e.data), 'base');
        }, !1);

        /**
         * Listen for database local updates
         */
        sseEvent.addEventListener('db', async function (e) {
            postToAll(JSON.parse(e.data), 'db');
        }, !1);

        /**
         * Listen for get requests updates
         */
        sseEvent.addEventListener('get', async function (e) {
            postToAll(JSON.parse(e.data), 'get');
        }, !1);
    }
}