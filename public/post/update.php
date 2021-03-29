<?php
if(filter_input(INPUT_POST, 'update', FILTER_VALIDATE_BOOLEAN))
    \Config\Config::updateSite();

$data['data'] = (float) json_decode(file_get_contents(PATH_HOME . '_config/config.json'), !0)['version'];

if(file_exists(PATH_HOME . "_cdn/version_required.json")) {
    $content = '<img data-id="' . strtotime('now') . '" src="' . HOME . 'public/assets/img/lights.png" style="height:auto;position: absolute;z-index:3;width: 160%;left: -30%;top: -55px;transform:rotate(90deg)">'
        . '<lottie-player src="' . HOME . 'public/assets/lottie/update.json" style="margin-top: -25px" background="transparent" speed="1" loop autoplay></lottie-player>'
        . '<div style="position: relative;z-index: 11;text-align: center;font-size: 16px;line-height: 21px;margin-top: 50px;">Atualize seu app ' . SITENAME . ' para continuar utilizando!<a target="_blank" href="market://details?id=paygas.com.br" class="btn btn-primary py-4 pl-4 pr-4 font-weight-bold" style="position: fixed;bottom: 20px;left: 10%;width: 80%;text-transform: uppercase">atualizar</a></div>';

    $content .= "<style>.modal-dialog, .modal-body {height: 100vh}.btn-primary[data-dismiss='modal'] {display: none}#core-content {overflow: hidden;height: 100vh}</style>";
    $content .= '<script>setInterval(function () {$("#notificationModal, #notificationModalParent").off();$("[data-dismiss=\'modal\']").parent().parent().parent().remove();}, 100);$(function() {window.onpopstate = null;});</script>';

    $create = new \Conn\Create();
    $create->exeCreate("popup", ["titulo" => "Nova versão", "descricao" => $content, "data_de_exibicao" => "2020-01-01 00:00", "ownerpub" => $_SESSION['userlogin']['id']]);
}