<?php

/**
 * Fix permissões
 */
$p = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), !0);
foreach ($p as $user => $entidades) {
    foreach ($entidades as $entidade => $permissoes) {
        if(!file_exists(PATH_HOME . "entity/cache/{$entidade}.json"))
            unset($p[$user][$entidade]);
    }
}

$f = fopen(PATH_HOME . "_config/permissoes.json", "w");
fwrite($f, json_encode($p));
fclose($f);

/**
 * Fix general
 */
$p = json_decode(file_get_contents(PATH_HOME . "entity/general/general_info.json"), !0);
foreach ($p as $entity => $dados) {
    if(!file_exists(PATH_HOME . "entity/cache/{$entity}.json")) {
        unset($p[$entity]);
        continue;
    }
    foreach ($dados['belongsTo'] as $i => $g) {
        foreach ($g as $entidade => $results) {
            if(!file_exists(PATH_HOME . "entity/cache/{$entidade}.json"))
                unset($p[$entity]['belongsTo'][$i][$entidade]);
        }
    }
}

$f = fopen(PATH_HOME . "entity/general/general_info.json", "w");
fwrite($f, json_encode($p));
fclose($f);
die;