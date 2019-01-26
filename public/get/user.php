<?php

$data['data'] = [];
if(file_exists(PATH_HOME . "_config/permissoes.json")) {
    $permissao = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), true);
    if($permissao[$_SESSION['userlogin']['setor']]['usuarios']['read']) {
        $read = new \Conn\Read();
        $read->exeRead("usuarios", "WHERE id != :id", "id={$_SESSION['userlogin']['id']}");
        if ($read->getResult()) {
            foreach ($read->getResult() as $item) {
                $data['data'][$item['id']] = ["id" => $item['id'], "nome" => $item['nome'], "setor" => $item['setor'], "nivel" => $item['nivel'], "status" => $item['status']];
            }
        }
    }
}