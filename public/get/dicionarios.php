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

        $permissao = $setor === "admin" || ($setor !== "0" && $setor === $entidade) || (!empty($permissoes[$entidade]['read']) && $permissoes[$entidade]['read']) || (!empty($permissoes[$entidade]['create']) && $permissoes[$entidade]['create']) || (!empty($permissoes[$entidade]['update']) && $permissoes[$entidade]['update']) || (!empty($permissoes[$entidade]['delete']) && $permissoes[$entidade]['delete']);

        //Se tiver permissão para ler
        if ($permissao) {
            $result = \Entity\Metadados::getDicionario($entidade, !0, !0);
            if (!empty($result)) {

                if (!empty($result[0]['id'])) {
                    foreach ($result as $id => $metas) {
                        if (!empty($metas['allow']['options']))
                            $metas['allow']['options'] = array_reverse($metas['allow']['options']);

                        $data['data'][$entidade][$metas['column']] = $metas;
                    }
                } else {

                    $indice = 99999;
                    foreach ($result as $id => $meta) {
                        if ($meta['key'] !== "identifier") {
                            $meta['id'] = $id;

                            if (!empty($meta['allow']['options']))
                                $meta['allow']['options'] = array_reverse($meta['allow']['options']);

                            $dicionario[$entidade][$meta['indice'] ?? $indice++] = $meta;
                        }
                    }

                    if (!empty($dicionario[$entidade])) {
                        ksort($dicionario[$entidade]);
                        foreach ($dicionario[$entidade] as $i => $meta)
                            $dicionarioOrdenado[$entidade][$meta['column']] = $meta;
                    }
                    $data['data'] = $dicionarioOrdenado;
                }
            }
        }
    }
}