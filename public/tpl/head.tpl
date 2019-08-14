<meta charset="UTF-8">
<meta name="robots" content="index, follow"/>
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title id="core-title">{$title}</title>
<link rel="canonical" href="{$home}">
<link rel="shortcut icon" href="{$home}assetsPublic/img/favicon.png">
<meta name="description" content="{$sitedesc}">
<link rel="manifest" href="{$home}manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="{{$theme}}">
<meta name="apple-mobile-web-app-title" content="{$sitename}">

<link rel="icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png">
<link rel="icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png">
<link rel="icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png">


<link rel="apple-touch-icon" href="{$home}assetsPublic/img/favicon-96.png">
<link rel="apple-touch-icon" sizes="96x96" href="{$home}assetsPublic/img/favicon-96.png">
<link rel="apple-touch-icon" sizes="144x144" href="{$home}assetsPublic/img/favicon-144.png">
<link rel="apple-touch-icon" sizes="192x192" href="{$home}assetsPublic/img/favicon-192.png">
<link rel="apple-touch-startup-image" href="{$home}assetsPublic/img/favicon-192.png">

<meta name="msapplication-square96x96logo" content="{$home}assetsPublic/img/favicon-96.png">
<meta name="msapplication-square192x192logo" content="{$home}assetsPublic/img/favicon-192.png">
<meta name="msapplication-square256x256logo" content="{$home}assetsPublic/img/favicon-256.png">
<meta name="msapplication-TileImage" content="{$home}assetsPublic/img/favicon.png">

<meta name="theme-color" content="{{$theme}}">
<meta name="msapplication-TileColor" content="{{$theme}}">
<meta name="msapplication-navbutton-color" content="{{$theme}}">
{*<meta name="apple-mobile-web-app-status-bar-style" content="black"> *}{* options: black, black-translucent *}

<link rel='stylesheet' href='{$home}assetsPublic/core.min.css'>

<style type="text/css" id="core-style"></style>
<script>
    const HOME = '{$home}';
    const DOMINIO = '{$dominio}';
    const VERSION = {$version};
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
    var AUTOSYNC = 1;
</script>

<script src='{$home}assetsPublic/appCore.min.js' defer></script>