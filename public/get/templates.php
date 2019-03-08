<?php

function getTemplates(string $base)
{
    $list = [];

    $tplPublic = "public/tpl/";
    foreach (\Helpers\Helper::listFolder(PATH_HOME . $base . $tplPublic) as $tpl) {
        if(preg_match('/\.mst$/i', $tpl))
            $list[str_replace('.mst', '', $tpl)] = file_get_contents(PATH_HOME . $base . $tplPublic . $tpl);
    }

    $setor = !empty($_SESSION['userlogin']) ? (!empty($_SESSION['userlogin']['setor']['entity']) ? $_SESSION['userlogin']['setor']['entity'] : "admin") : 0;
        $tplPublic = "public/tpl/{$setor}/";
        foreach (\Helpers\Helper::listFolder(PATH_HOME . $base . $tplPublic) as $tpl) {
            if(preg_match('/\.mst$/i', $tpl))
                $list[str_replace('.mst', '', $tpl)] = file_get_contents(PATH_HOME . $base . $tplPublic . $tpl);
        }

    return $list;
}

$data['data'] = [];
$data['data'] = getTemplates("");

foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
    foreach (getTemplates(VENDOR . $lib . "/") as $tpl => $dados) {
        if(!in_array($tpl, array_keys($data['data'])))
            $data['data'][$tpl] = $dados;
    }
}