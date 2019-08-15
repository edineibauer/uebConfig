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

    <aside id="core-sidebar" class="core-class-container">
        {include 'aside.tpl'}
    </aside>

    {include 'loading.tpl'}

    <section id="core-content" class="core-class-container"></section>

    <div id="core-upload-progress"><div id="core-upload-progress-bar"></div></div>
    <div class="hide s-show" id="core-header-nav-bottom">
        <nav role="navigation">
            <ul class="core-class-container" style="padding:0">
                <div class="core-open-menu">
                    <div class="core-menu-icon color-text-gray-dark"></div>
                </div>
                <div id="core-menu-custom-bottom" class="left"></div>
            </ul>
        </nav>
    </div>
</div>
{include 'analytics.tpl'}

</body>
</html>