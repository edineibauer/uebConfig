<meta charset="UTF-8">
<meta name="robots" content="index, follow"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="core-title">{$title}</title>
<link rel="canonical" href="{$home}">
<link rel="shortcut icon" href="{$home}assetsPublic/img/favicon.png?v={$version}">
<meta name="description" content="{$sitedesc}">
<link rel="manifest" href="{$home}manifest.json?v={$version}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="{{$theme}}">
<meta name="apple-mobile-web-app-title" content="{$sitename}">

<link rel="icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png?v={$version}">
<link rel="icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png?v={$version}">
<link rel="icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">


<link rel="apple-touch-icon" href="{$home}assetsPublic/img/favicon-96.png?v={$version}">
<link rel="apple-touch-icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png?v={$version}">
<link rel="apple-touch-icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png?v={$version}">
<link rel="apple-touch-icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">
<link rel="apple-touch-startup-image" href="{$home}assetsPublic/img/favicon-192.png?v={$version}">

<meta name="msapplication-square96x96logo" content="{$home}assetsPublic/img/favicon-96.png?v={$version}">
<meta name="msapplication-square192x192logo" content="{$home}assetsPublic/img/favicon-192.png?v={$version}">
<meta name="msapplication-square256x256logo" content="{$home}assetsPublic/img/favicon-256.png?v={$version}">
<meta name="msapplication-TileImage" content="{$home}assetsPublic/img/favicon.png?v={$version}">

<meta name="theme-color" content="{{$theme}}">
<meta name="msapplication-TileColor" content="{{$theme}}">
<meta name="msapplication-navbutton-color" content="{{$theme}}">

<link rel='stylesheet' href='{$home}assetsPublic/core.min.css?v={$version}'>
<link rel='stylesheet' href='{$home}assetsPublic/fonts.min.css?v={$version}'>

<script>
    let isEdge = window.navigator.userAgent.indexOf("Edge") > -1 || /MSIE 10/i.test(navigator.userAgent) || /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent);
    const SERVICEWORKER = {if ($serviceworker)}'serviceWorker' in navigator && !isEdge{else}!1{/if};
    const HOME = '{$home}';
    const PUBLICO = '{$publico}';
    const DOMINIO = '{$dominio}';
    const VERSION = {$version};
    const DEV = '{$dev}';
    const VENDOR = '{$vendor}';
    const HOMEPAGE = '{$homepage}';
    const THEME = '{$theme}';
    const THEMETEXT = '{$themeColor}';
    const TITLE = '{$title}';
    const LOGO = '{$logo}';
    const FAVICON = '{$favicon}';
    const LIMITOFFLINE = '{$limitoffline}';
    const PUSH_PUBLIC_KEY = '{$pushpublic}';
    const USER = JSON.parse('{$user}');
</script>

<script src='{$home}assetsPublic/appCore.min.js?v={$version}' defer></script>