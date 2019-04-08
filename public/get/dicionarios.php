<?php

use Config\Config;
use Entity\Entity;
use Helpers\Helper;

$permissoes = Config::getPermission();
$setor = !empty($_SESSION['userlogin']['setor']) ? $_SESSION['userlogin']['setor'] : "0";
$permissoes = isset($permissoes[$setor]) ? $permissoes[$setor] : [];

//convert dicionário para referenciar colunas e não ids
$data['data'] = [];

foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
    if ($entity !== "info" && preg_match("/\.json$/i", $entity)) {
        $entidade = str_replace(".json", "", $entity);
        $user = (!empty($_SESSION['userlogin']['setor']) && file_exists(PATH_HOME . "entity/" . $_SESSION['userlogin']['setor'] . "/{$entity}") ? $_SESSION['userlogin']['setor'] : "cache");

        //Se tiver permissão para ler
        if (($setor === "admin" || (!empty($permissoes[$entidade]['read']) && $permissoes[$entidade]['read']))) {
            $result = Helper::convertStringToValueArray(json_decode(file_get_contents(PATH_HOME . "entity/{$user}/{$entity}"), !0));
            if (!empty($result)) {
                foreach ($result as $id => $metas) {
                    if (!empty($metas['allow']['options']))
                        $metas['allow']['options'] = array_reverse($metas['allow']['options']);

                    $data['data'][$entidade][$metas['column']] = $metas;
                }
            }
        }
    }
}