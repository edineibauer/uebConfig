<div id="core-header-container">
    <header id="core-header-logo">
        <a href="{$home}{($homepage) ? "dashboard" : ""}" id="logo-href">
            {if $logo !== ""}
                <img src='{$home}assetsPublic/img/logo.png' alt='logo do site {$title}' title='{$title}' height='39' id='core-header-img'>
                <h1 style='font-size:0'>{$sitename}</h1>
            {else}
                <img src='{$home}assetsPublic/img/favicon-48.png' height='35' style='height: 35px;padding-right:5px' class='core-header-img'>
                <h1 id='core-header-title' class='theme-text-aux s-hide'>{$sitename}</h1>
            {/if}
        </a>
    </header>

    <nav role="navigation">
        <ul id="core-header-nav">
            <div id="core-menu-custom"></div>
            <div class="theme-hover-d core-open-menu s-hide">
                <div class="theme-text-aux menu icon" data-before="menu" data-after="remove"></div>
            </div>
        </ul>
    </nav>
</div>

<div class="hide s-show" id="core-header-nav-bottom">
    <nav role="navigation">
        <ul class="core-class-container">
            <div id="core-menu-custom"></div>

            <div class="theme-hover-d core-open-menu">
                <div class="theme-text-aux menu icon" data-before="menu" data-after="remove"></div>
            </div>
        </ul>
    </nav>
</div>