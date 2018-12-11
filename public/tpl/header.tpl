<div id="core-header-container" {if !$loged}style="max-width: 1200px;"{/if}>
    <header id="core-header-logo">
        <a href="{$home}">
            {if $logo != "" && $logo != $home}
                <img src="{$logo}" alt="logo do site {$sitename}"
                     title="{$sitename} {($sitesub != "") ? " - $sitesub" : ""}" height="39" id="core-header-img">
                <h1 style="font-size:0">{$sitename}</h1>
            {elseif $favicon && $favicon != $home}
                <img src="{$favicon}" height="35" style="height: 35px" class="core-header-img">
                <h1 id="core-header-title" class="theme-text-aux">{$sitename}</h1>
            {else}
                <h1 id="core-header-title" class="theme-text-aux">{$sitename}</h1>
            {/if}
        </a>
    </header>

    <nav role="navigation">
        <ul id="core-header-nav">
            <div id="core-menu-custom">
                {$menu}
                {if $loged}
                    <li>
                        <a href="{$home}dashboard" class="theme-text-aux theme-hover-d">minha conta</a>
                    </li>
                    <li>
                        <span onclick="logoutDashboard()" class="theme-text-aux theme-hover-d">SAIR</span>
                    </li>
                {else}
                    <li class="hover-theme">
                        <a href="{$home}login" class="theme-text-aux theme-hover-d">login</a>
                    </li>
                {/if}
            </div>

            <div id="core-open-menu" class="theme-hover-d">
                <div class="theme-text-aux menu icon" data-before="menu" data-after="remove"></div>
            </div>
        </ul>
    </nav>
</div>