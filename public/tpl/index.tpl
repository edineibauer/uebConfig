<!DOCTYPE html>
<html lang="pt-br">
<head>
    {include 'head.tpl'}
</head>
<body>
<div id="app">

    <div id="core-header" class="theme">
        {include 'header.tpl'}
    </div>

    <aside id="core-sidebar" class="core-class-container hide">
        {include 'aside.tpl'}
    </aside>

    {include 'loading.tpl'}

    <section id="core-content" class="core-class-container"></section>
    <ul id="core-log"></ul>

    <div id="core-upload-progress"><div id="core-upload-progress-bar"></div></div>
    <div class="hide" id="core-header-nav-bottom">
        <nav role="navigation">
            <ul class="core-class-container" style="padding:0">
                <div id="core-menu-custom-bottom" style="float: left"></div>
            </ul>
        </nav>
    </div>
</div>
{include 'analytics.tpl'}

</body>
</html>