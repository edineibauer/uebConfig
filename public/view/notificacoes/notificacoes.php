<section id="mensagem">
    <div class="container">
        <div class="row rowHeader">
            <a href="#back" class="voltaRelativo float-left">
                <i class="material-icons float-left">arrow_back</i>
                <h3 class="titulo float-left">Notificações</h3>
            </a>
            <button class="float-right btn-notify hide theme" onclick="subscribeUser();">
                <i class="material-icons float-left">notifications</i>
                <div class="float-left pl-2">avisar</div>
            </button>
        </div>
        <div class="row">
            <div class="col-12">
                <div id="notificacoes" data-template="note"></div>
            </div>
        </div>
    </div>
</section>