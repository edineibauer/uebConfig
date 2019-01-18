<?php

/**
 * Cria arquivos minificados dos reacts na pasta publica
 * Retorna lista de arquivos reacts disponíveis
 */

$data['data'] = [];
$setor = $_SESSION['userlogin']['setor'] ?? null;

\Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react");

if(file_exists(PATH_HOME . "public/react")) {
    if ($setor && file_exists(PATH_HOME . "public/react/{$setor}")) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react/{$setor}") as $entity) {
            if(is_dir(PATH_HOME . "public/react/{$setor}/{$entity}")) {
                foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react/{$setor}/{$entity}") as $reactFile) {
                    $fileName = pathinfo($reactFile, PATHINFO_FILENAME);
                    $fileExt = pathinfo($reactFile, PATHINFO_EXTENSION);
                    if ("js" === $fileExt && in_array($fileName, ['update', 'create', 'delete'])) {

                        //create Cached react if not exist (necessita para funcionamento)
                        if(!file_exists(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js")){
                            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}");
                            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}");
                            $m = new MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . "public/react/{$setor}/{$entity}/{$reactFile}"));
                            file_put_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js" ,$m->minify());
                        }
                        $data['data'][$entity][$fileName] = file_get_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js");
                    }
                }
            }
        }
    } elseif (file_exists(PATH_HOME . "public/react")) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react") as $entity) {
            if(is_dir(PATH_HOME . "public/react/{$entity}")) {
                foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/react/{$entity}") as $reactFile) {
                    $fileName = pathinfo($reactFile, PATHINFO_FILENAME);
                    $fileExt = pathinfo($reactFile, PATHINFO_EXTENSION);
                    if ("js" === $fileExt && in_array($fileName, ['update', 'create', 'delete'])) {

                        //create Cached react if not exist (necessita para funcionamento)
                        if(!file_exists(PATH_HOME . "assetsPublic/react/{$entity}/{$fileName}.min.js")){
                            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react");
                            \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$entity}");
                            $m = new MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . "public/react/{$entity}/{$reactFile}"));
                            file_put_contents(PATH_HOME . "assetsPublic/react/{$entity}/{$fileName}.min.js" ,$m->minify());
                        }
                        $data['data'][$entity][$fileName] = file_get_contents(PATH_HOME . "assetsPublic/react/{$entity}/{$fileName}.min.js");
                    }
                }
            }
        }
    }
}

foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
    if(file_exists(PATH_HOME . VENDOR . "{$lib}/public/react")) {
        if ($setor && file_exists(PATH_HOME . VENDOR . "{$lib}/public/react/{$setor}")) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME .  VENDOR . "{$lib}/public/react/{$setor}") as $entity) {
                if(is_dir(PATH_HOME .  VENDOR . "{$lib}/public/react/{$setor}/{$entity}")) {
                    foreach (\Helpers\Helper::listFolder(PATH_HOME .  VENDOR . "{$lib}/public/react/{$setor}/{$entity}") as $reactFile) {
                        $fileName = pathinfo($reactFile, PATHINFO_FILENAME);
                        $fileExt = pathinfo($reactFile, PATHINFO_EXTENSION);
                        if ("js" === $fileExt && in_array($fileName, ['update', 'create', 'delete'])) {

                            //create Cached react if not exist (necessita para funcionamento)
                            if(!file_exists(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js")){
                                \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}");
                                \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}");
                                $m = new MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME .  VENDOR . "{$lib}/public/react/{$setor}/{$entity}/{$reactFile}"));
                                file_put_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js" ,$m->minify());
                            }
                            $data['data'][$entity][$fileName] = file_get_contents(PATH_HOME . "assetsPublic/react/{$setor}/{$entity}/{$fileName}.min.js");
                        }
                    }
                }
            }
        } elseif (file_exists(PATH_HOME .  VENDOR . "{$lib}/public/react")) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME .  VENDOR . "{$lib}/public/react") as $entity) {
                if(is_dir(PATH_HOME .  VENDOR . "{$lib}/public/react/{$entity}")) {
                    foreach (\Helpers\Helper::listFolder(PATH_HOME .  VENDOR . "{$lib}/public/react/{$entity}") as $reactFile) {
                        $fileName = pathinfo($reactFile, PATHINFO_FILENAME);
                        $fileExt = pathinfo($reactFile, PATHINFO_EXTENSION);
                        if ("js" === $fileExt && in_array($fileName, ['update', 'create', 'delete'])){

                            //create Cached react if not exist (necessita para funcionamento)
                            if(!file_exists(PATH_HOME . "assetsPublic/react/{$entity}/{$fileName}.min.js")){
                                \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react");
                                \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/react/{$entity}");
                                $m = new MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME .  VENDOR . "{$lib}/public/react/{$entity}/{$reactFile}"));
                                file_put_contents(PATH_HOME . "assetsPublic/react/{$entity}/{$fileName}.min.js" ,$m->minify());
                            }
                            $data['data'][$entity][$fileName] = file_get_contents(PATH_HOME .  "assetsPublic/react/{$entity}/{$fileName}.min.js");
                        }
                    }
                }
            }
        }
    }
}