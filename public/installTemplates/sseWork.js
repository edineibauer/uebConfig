var SERVER = '', sseEvent = null, token = "", ports = [];

self.addEventListener("connect", function (e) {
    let port = e.ports[0];
    port.addEventListener("message", function (e) {
        if(token === "") {
            token = e.data;
            ports.push(port);
            startSSE();
        } else if(token === e.data) {
            ports.push(port);
        }
    }, false);

    port.start();

}, false);

function postToAll(message, type) {
    ports.forEach(port => port.postMessage(JSON.stringify({data: message, type: type})));
}

async function baseFunctions() {
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

function startSSE() {
    if(!sseEvent) {
        sseEvent = new EventSource(SERVER + "get/sseEngineEvent/maestruToken/" + token, {withCredentials: true});
        baseFunctions();
    }
}