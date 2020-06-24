<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Content-Type: text/html; charset=UTF-8');

include_once '_config/config.php';

if(!file_exists(PATH_HOME . "assetsPublic/appCore.min.js")) {
    new Config\UpdateSystem();
    header("Location: " . HOME);
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
    <title id="core-title"><?= SITENAME ?></title>
    <link rel="canonical" href="<?= HOME ?>">
    <link rel="shortcut icon" href="<?= HOME ?>assetsPublic/img/favicon.png?v=<?= VERSION ?>">
    <meta name="description" content="<?= SITEDESC ?>">
    <link rel="manifest" href="<?= HOME ?>manifest.json?v=<?= VERSION ?>">

    <link rel="icon" sizes="96x96" href="<?= HOME ?>assetsPublic/img/favicon-96.png?v=<?= VERSION ?>">
    <link rel="icon" sizes="144x144" href="<?= HOME ?>assetsPublic/img/favicon-144.png?v=<?= VERSION ?>">
    <link rel="icon" sizes="192x192" href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>">

    <meta name="mobile-web-app-capable" content="yes"/>
    <meta name="apple-touch-fullscreen" content="yes"/>
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="<?= SITENAME ?>">

    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone1.png"
          media="(device-width: 640px) and (device-height: 1136px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone2.png"
          media="(device-width: 750px) and (device-height: 1334px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone3.png"
          media="(device-width: 828px) and (device-height: 1792px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone4.png"
          media="(device-width: 1242px) and (device-height: 2208px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone5.png"
          media="(device-width: 1125px) and (device-height: 2436px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/iphone6.png"
          media="(device-width: 1242px) and (device-height: 2688px) and (-webkit-device-pixel-ratio: 3)"
          rel="apple-touch-startup-image"/>

    <link href="<?= HOME ?>assetsPublic/img/splashscreens/ipad1.png"
          media="(device-width: 1536px) and (device-height: 2048px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/ipad2.png"
          media="(device-width: 1668px) and (device-height: 2224px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/ipad3.png"
          media="(device-width: 1668px) and (device-height: 2388px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/splashscreens/ipad4.png"
          media="(device-width: 2048px) and (device-height: 2732px) and (-webkit-device-pixel-ratio: 2)"
          rel="apple-touch-startup-image"/>

    <link rel="apple-touch-icon" href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>">
    <link rel="apple-touch-icon" sizes="96x96" href="<?= HOME ?>assetsPublic/img/favicon-96.png?v=<?= VERSION ?>">
    <link rel="apple-touch-icon" sizes="144x144" href="<?= HOME ?>assetsPublic/img/favicon-144.png?v=<?= VERSION ?>">
    <link rel="apple-touch-icon" sizes="192x192" href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>">
    <link rel="apple-touch-startup-image" href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>">

    <link href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>" sizes="2048x2732"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>" sizes="1668x2224"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-144.png?v=<?= VERSION ?>" sizes="1536x2048"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-144.png?v=<?= VERSION ?>" sizes="1125x2436"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-144.png?v=<?= VERSION ?>" sizes="1242x2208"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-96.png?v=<?= VERSION ?>" sizes="750x1334"
          rel="apple-touch-startup-image"/>
    <link href="<?= HOME ?>assetsPublic/img/favicon-96.png?v=<?= VERSION ?>" sizes="640x1136"
          rel="apple-touch-startup-image"/>

    <meta name="msapplication-square96x96logo" content="<?= HOME ?>assetsPublic/img/favicon-96.png?v=<?= VERSION ?>">
    <meta name="msapplication-square192x192logo" content="<?= HOME ?>assetsPublic/img/favicon-192.png?v=<?= VERSION ?>">
    <meta name="msapplication-square256x256logo" content="<?= HOME ?>assetsPublic/img/favicon-256.png?v=<?= VERSION ?>">
    <meta name="msapplication-TileImage" content="<?= HOME ?>assetsPublic/img/favicon.png?v=<?= VERSION ?>">

    <meta name="theme-color" content="<?= THEME ?>">
    <meta name="msapplication-TileColor" content="<?= THEME ?>">
    <meta name="msapplication-navbutton-color" content="<?= THEME ?>">

    <link rel='stylesheet' href='<?= HOME ?>assetsPublic/appCore.min.css?v=<?= VERSION ?>'>
    <link rel='stylesheet' href='<?= HOME ?>assetsPublic/fonts.min.css?v=<?= VERSION ?>'>

    <script>
        const SERVICEWORKER = <?=(SERVICEWORKER ? "'serviceWorker' in navigator && !(window.navigator.userAgent.indexOf(\"Edge\") > -1 || /MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent))" : "!1")?>;
        const HOME = '<?=HOME?>';
        const SITENAME = '<?=SITENAME?>';
        const DOMINIO = '<?=DOMINIO?>';
        const VERSION = '<?=VERSION?>';
        const DEV = <?=DEV?>;
        const VENDOR = '<?=VENDOR?>';
        const HOMEPAGE = '<?=HOMEPAGE?>';
        const THEME = '<?=THEME?>';
        const THEMETEXT = '<?=THEMETEXT?>';
        const LOGO = '<?=LOGO?>';
        const FAVICON = '<?=FAVICON?>';
        const LIMITOFFLINE = <?=LIMITOFFLINE?>;
        const PUSH_PUBLIC_KEY = '<?=(defined('PUSH_PUBLIC_KEY') ? PUSH_PUBLIC_KEY : "")?>';
        var USER = {};
        var FRONT = {};
        var TITLE = '<?=SITENAME?>';
    </script>

    <script src='<?= HOME ?>assetsPublic/appCore.min.js?v=<?= VERSION ?>' defer></script>
</head>

<body ontouchstart="">
<div id="app">
    <div id="core-header" class="theme">
        <div id="core-header-container">
            <header id="core-header-logo">
                <a href="<?= HOME . (HOMEPAGE ? "dashboard" : "") ?>" id="logo-href">
                    <img src='<?= HOME ?>assetsPublic/img/favicon-48.png?v=<?= VERSION ?>' height='35' style='height: 35px;padding-right:5px' class='core-header-img'>
                    <h1 id='core-header-title' class='theme-text-aux'><?= SITENAME ?></h1>
                </a>
            </header>

            <nav role="navigation">
                <ul id="core-header-nav">
                    <div id="core-menu-custom"></div>
                </ul>
            </nav>
        </div>
    </div>

    <aside id="core-sidebar" class="core-class-container hide">
        <div class="theme core-class-container" id="core-sidebar-header">
            <div id="core-sidebar-perfil" class="core-class-container theme-border-l">
                <div class="left" id="core-sidebar-imagem"></div>

                <div id="core-sidebar-perfil-name">
                    <div class="core-class-container" id="core-header-name">
                        <strong id="core-sidebar-nome"></strong>

                        <span id="core-sidebar-edit">
                    <i class="material-icons">edit</i>
                </span>
                    </div>
                </div>
            </div>
        </div>

        <div id="core-sidebar-main" class="core-class-container">
            <ul id="core-applications" class="core-class-container"></ul>
            <ul id="core-sidebar-menu" class="core-class-container"></ul>
        </div>

        <div class="core-sidebar-bottom">
            <div onclick="updateAppUser();" class="theme theme-border-l update-site-btn">
                <i class="material-icons">refresh</i>
                <span>Atualizar</span>
            </div>

            <div onclick="subscribeUser();" class="theme theme-border-l update-site-btn site-btn-push" style="padding:2px 5px; margin-left: 2px;cursor:pointer">
                <i class="material-icons">notifications_active</i>
            </div>

            <div id="login-aside">
                <div>sair</div>
                <i class="material-icons">exit_to_app</i>
            </div>
        </div>
    </aside>

    <div id="core-overlay"></div>
    <div id="core-loader">
        <svg viewBox="0 0 32 32" width="32" height="32">
            <circle id="core-spinner"
                    style="stroke: <?= (in_array(THEME, ["#fff", "#FFF", "#ffffff", "#FFFFFF"]) ? "#555" : THEME) ?>"
                    cx="16" cy="16" r="14" fill="none"></circle>
        </svg>
    </div>

    <section id="core-content" class="core-class-container"></section>

    <div id="core-upload-progress">
        <div id="core-upload-progress-bar"></div>
    </div>
    <div class="hide" id="core-header-nav-bottom">
        <nav role="navigation">
            <ul class="core-class-container" style="padding:0">
                <div id="core-menu-custom-bottom" style="float: left"></div>
            </ul>
        </nav>
    </div>
</div>
</body>
</html>