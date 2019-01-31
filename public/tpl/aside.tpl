<div class="theme core-class-container" id="core-sidebar-header">
    <div id="core-sidebar-perfil" class="core-class-container theme-border-l">
        {if $loged}
            {if $login.imagem}
                <img src="{$home}image/{$login.imagem}&h=120&w=120" height="80" width="100" id="core-sidebar-perfil-img">
            {else}
                <div id="core-sidebar-perfil-img"><i class="material-icons">people</i></div>
            {/if}
            <div id="core-sidebar-perfil-name">
                <div class="core-class-container" id="core-header-name">
                    <strong class="padding-right left no-select dashboard-nome"></strong>

                    <span class="left pointer menu-li padding-small color-gray-light opacity hover-opacity-off hover-shadow radius"
                          data-action="form" data-entity="usuarios"
                          data-atributo="{$login.id}">
                        <i class="material-icons left font-large">edit</i>
                    </span>
                </div>
            </div>
        {else}
            <i id="core-sidebar-perfil-img" class="material-icons">people</i>
            <div id="core-sidebar-name">
                Anônimo
            </div>
        {/if}
    </div>
</div>

<div id="core-sidebar-main" class="core-class-container">
    <ul id="core-applications" class="core-class-container"></ul>

    <ul id="core-sidebar-menu" class="core-class-container">
        {$menu}
        {if $loged}
            <li>
                <a href="{$home}dashboard">
                    Minha Conta
                </a>
            </li>
            <li>
                    <span onclick="logoutDashboard()">
                        sair
                    </span>
            </li>
        {else}
            <li>
                <a href="{$home}login">login</a>
            </li>
        {/if}
    </ul>
</div>