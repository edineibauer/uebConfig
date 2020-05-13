<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="robots" content="index, follow"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title id="core-title">{$title}</title>
    <link rel="canonical" href="{$home}">
    <link rel="shortcut icon" href="{$home}assetsPublic/img/favicon.png?v={$version}">
    <meta name="description" content="{$sitedesc}">
    <link rel="manifest" href="{$home}manifest.json?v={$version}">

    <link rel="icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png?v={$version}">
    <link rel="icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png?v={$version}">
    <link rel="icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="{{$theme}}">
    <meta name="apple-mobile-web-app-title" content="{$sitename}">

    <link rel="apple-touch-icon" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">
    <link rel="apple-touch-icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png?v={$version}">
    <link rel="apple-touch-icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png?v={$version}">
    <link rel="apple-touch-icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">
    <link rel="apple-touch-startup-image" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">

    <link href="{$home}assetsPublic/img/favicon-192.png?v={$version}" sizes="2048x2732" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-192.png?v={$version}" sizes="1668x2224" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-144.png?v={$version}" sizes="1536x2048" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-144.png?v={$version}" sizes="1125x2436" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-144.png?v={$version}" sizes="1242x2208" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-96.png?v={$version}" sizes="750x1334" rel="apple-touch-startup-image" />
    <link href="{$home}assetsPublic/img/favicon-96.png?v={$version}" sizes="640x1136" rel="apple-touch-startup-image" />

    <meta name="msapplication-square96x96logo" content="{$home}assetsPublic/img/favicon-96.png?v={$version}">
    <meta name="msapplication-square192x192logo" content="{$home}assetsPublic/img/favicon-192.png?v={$version}">
    <meta name="msapplication-square256x256logo" content="{$home}assetsPublic/img/favicon-256.png?v={$version}">
    <meta name="msapplication-TileImage" content="{$home}assetsPublic/img/favicon.png?v={$version}">

    <meta name="theme-color" content="{{$theme}}">
    <meta name="msapplication-TileColor" content="{{$theme}}">
    <meta name="msapplication-navbutton-color" content="{{$theme}}">

    <link rel='stylesheet' href='{$home}assetsPublic/appCore.min.css?v={$version}'>
    <link rel='stylesheet' href='{$home}assetsPublic/fonts.min.css?v={$version}'>

    <script>
        let isEdge = window.navigator.userAgent.indexOf("Edge") > -1 || /MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent);
        const SERVICEWORKER = {if ($serviceworker)}'serviceWorker' in navigator && !isEdge{else}!1{/if};
        const HOME = '{$home}';
        const SITENAME = '{$sitename}';
        const SITESUB = '{$sitesub}';
        const PUBLICO = '{$publico}';
        const DOMINIO = '{$dominio}';
        const VERSION = '{$version}';
        const DEV = {$dev};
        const VENDOR = '{$vendor}';
        const HOMEPAGE = '{$homepage}';
        const THEME = '{$theme}';
        const THEMETEXT = '{$themeColor}';
        const LOGO = '{$logo}';
        const FAVICON = '{$favicon}';
        const LIMITOFFLINE = '{$limitoffline}';
        const PUSH_PUBLIC_KEY = '{$pushpublic}';
        var USER = {};
        var TITLE = '{$title}';
        var FRONT = {};
        {if !empty($variaveis)}FRONT.VARIAVEIS = {$variaveis|json_encode};{/if}
    </script>

    <script src='{$home}assetsPublic/appCore.min.js?v={$version}' defer></script>
</head>
<body>
<div id="app">

    <div id="core-header" class="theme"></div>

    <aside id="core-sidebar" class="core-class-container hide"></aside>

    <div id="core-overlay"></div>
    <div id="core-loader">
        <svg viewBox="0 0 32 32" width="32" height="32">
            <circle id="core-spinner" style="stroke: {($theme === "#fff" || $theme === "#ffffff" || $theme === "#FFF") ? "#555" : $theme}" cx="16" cy="16" r="14" fill="none"></circle>
        </svg>
    </div>

    <section id="core-content" class="core-class-container"></section>

    <div id="core-upload-progress"><div id="core-upload-progress-bar"></div></div>
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