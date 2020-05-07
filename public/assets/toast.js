var toastTime = null;

function toast(message, duration, className, completeCallback) {
    clearToast();
    // Settings
    if (typeof className === "undefined" && typeof duration === "string") {
        className = duration;
        duration = 4000;
    } else if (typeof className === "number" && typeof duration === "string") {
        let d = duration;
        duration = className;
        className = d;
    }

    let settings = $.extend({
        message: message || '',
        displayLength: duration || 4000,
        className: className || '',
        completeCallback: completeCallback || $.noop
    }, $.isPlainObject(message) ? message : {});

    // If no message, no toast
    if (!settings.message || $.isPlainObject(settings.message))
        return false;

    // Append toast
    let $toast = createToast(settings.message, settings.className).appendTo('body');

    // Animate toast in
    $toast.animate({"top": "0px", opacity: 1}, {
        duration: 300,
        queue: false
    });

    //setTimeout
    toastTime = setTimeout(function () {
        clearToast();
    }, settings.displayLength);
}

function createToast(html, className) {
    let $toast = $('<div class="toast ' + className + '" style="top: -75px; opacity: 0">' + html + '</div>');
    new TouchHorizontal($toast, -300, 50, 0, () => clearToast());
    return $toast;
}

function clearToast() {
    clearTimeout(toastTime);
    let $toasts = $(".toast");
    $toasts.fadeOut(300);
    setTimeout(function () {
        $toasts.remove();
    }, 300);
}