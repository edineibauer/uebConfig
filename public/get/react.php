<?php

/**
 * Cria arquivos minificados dos reacts na pasta publica
 * Retorna lista de arquivos reacts disponíveis
 */

use \Helpers\Helper;

$data['data'] = [];
$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react");
$list = [];

/**
 * @param string $path
 * @param array $list
 * @param $setor
 * @param string $entity
 * @return array
 */
if(!function_exists('addReact')) {
    function addReact(string $path, array $list, $setor, string $entity): array
    {
        foreach (Helper::listFolder($path) as $reactFile) {
            $fileName = pathinfo($reactFile, PATHINFO_FILENAME);
            $fileExt = pathinfo($reactFile, PATHINFO_EXTENSION);
            if ("js" === $fileExt && in_array($fileName, ['update', 'create', 'delete'])) {

                //create Cached react if not exist (necessita para funcionamento)
                if (!file_exists(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js")) {
                    Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}");
                    Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}");
                    $m = new MatthiasMullie\Minify\JS(file_get_contents("{$path}/{$reactFile}"));
                    file_put_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js", $m->minify());
                }

                $list[$entity][$fileName] = file_get_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js");
            }
        }

        return $list;
    }
}

if (file_exists(PATH_HOME . "public/react")) {
    if ($setor && file_exists(PATH_HOME . "public/react/{$setor}")) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react/{$setor}") as $entity) {
            if (is_dir(PATH_HOME . "public/react/{$setor}/{$entity}"))
                $data['data'] = addReact(PATH_HOME . "public/react/{$setor}/{$entity}", $data['data'], $setor, $entity);
        }
    }

    foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react") as $entity) {
        if (is_dir(PATH_HOME . "public/react/{$entity}"))
            $data['data'] = addReact(PATH_HOME . "public/react/{$entity}", $data['data'], $setor, $entity);
    }
}

foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
    if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/react")) {
        if ($setor && file_exists(PATH_HOME . VENDOR . "{$lib}/public/react/{$setor}")) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . "{$lib}/public/react/{$setor}") as $entity) {
                if (is_dir(PATH_HOME . VENDOR . "{$lib}/public/react/{$setor}/{$entity}"))
                    $data['data'] = addReact(PATH_HOME . VENDOR . "{$lib}/public/react/{$setor}/{$entity}", $data['data'], $setor, $entity);
            }
        }
        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . "{$lib}/public/react") as $entity) {
            if (is_dir(PATH_HOME . VENDOR . "{$lib}/public/react/{$entity}"))
                $data['data'] = addReact(PATH_HOME . VENDOR . "{$lib}/public/react/{$entity}", $data['data'], $setor, $entity);
        }
    }
}