var toastTime = null;

function toast(message, duration, className, completeCallback) {
    clearToast();
    // Settings
    if (typeof className === "undefined" && typeof duration === "string") {
        className = duration;
        duration = 4000;
    }
    var settings = $.extend({
        message: message || '',
        displayLength: duration || 4000,
        className: className || '',
        completeCallback: completeCallback || $.noop
    }, $.isPlainObject(message) ? message : {});

    // Get container
    var $container = $('#toast-container');

    // Create toast container if it does not exist
    if (!$container.length)
        $container = $('<div id="toast-container">').appendTo('body');

    // If no message, no toast
    if (!settings.message || $.isPlainObject(settings.message))
        return false;

    // Append toast
    var $toast = createToast(settings.message).appendTo($container);

    // Animate toast in
    $toast.animate({"top": "0px", opacity: 1}, {
        duration: 300,
        queue: false
    });

    function createToast(html) {

        // Create toast
        var $toast = $('<div class="toast ' + settings.className + '" style="top: -75px; opacity: 0">' + html + '</div>');

        new TouchLeft($toast, -300, 80, 10, function ($this, $el) {
            clearTimeout(toastTime);
            $el.remove();
            $("#toast-container").remove();
        });

        return $toast;
    }
};

function clearToast() {
    clearTimeout(toastTime);
    $("#toast-container").remove();
    let $toasts = $(".toast");
    $toasts.fadeOut(300);
    setTimeout(function () {
        $toasts.remove();
    }, 300);
}