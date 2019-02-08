<?php

$data['data'] = [];
if(file_exists(PATH_HOME . "_config/permissoes.json")) {
    $permissao = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), true);
    $read = new \Conn\Read();
    $read->exeRead("usuarios");
    if ($read->getResult()) {
        foreach ($read->getResult() as $item)
            $data['data'][$item['id']] = ["id" => $item['id'], "nome" => $item['nome'], "setor" => $item['setor'], "nivel" => $item['nivel'], "status" => $item['status']];
    }
}