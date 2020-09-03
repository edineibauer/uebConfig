importScripts("https://www.gstatic.com/firebasejs/7.19.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.19.1/firebase-messaging.js");

const HOME = '';
const PUSH_PUBLIC_KEY = '';
var VERSION = '';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();
messaging.usePublicVapidKey(PUSH_PUBLIC_KEY);

messaging.setBackgroundMessageHandler(payload => {
   const title = payload.data.title;
   const options = {
       data: payload.data.data,
       icon: payload.data.icon || (HOME + "assetsPublic/img/favicon.png?v=" + VERSION),
       badge: payload.data.badge || (HOME + "assetsPublic/img/favicon.png?v=" + VERSION),
       id: payload.data.id || "",
       tag: payload.data.id || ""
   };

    /**
     * track received push
     */
    if (typeof title === "string" && title.length > 2)
        fetch(HOME + "get/receivePush/" + payload.data.id);

   return self.registration.showNotification(title, options);
});