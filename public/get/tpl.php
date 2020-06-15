<?php
$data['data'] = [];

$setor = !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";

if (!empty($variaveis)) {
    foreach ($variaveis as $variavel) {
        $data['data'][$variavel] = "";
        if (file_exists(PATH_HOME . "public/tpl/{$setor}")) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/tpl/{$setor}") as $tpl) {
                $ext = pathinfo($tpl, PATHINFO_EXTENSION);
                $file = pathinfo($tpl, PATHINFO_FILENAME);
                if ($ext === "mst" && $file === $variavel) {
                    $data['data'][$variavel] = file_get_contents(PATH_HOME . "public/tpl/{$setor}/{$tpl}");
                    break;
                }
            }
        }
        if (empty($data['data'][$variavel]) && file_exists(PATH_HOME . "public/tpl")) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/tpl") as $tpl) {
                $ext = pathinfo($tpl, PATHINFO_EXTENSION);
                $file = pathinfo($tpl, PATHINFO_FILENAME);
                if ($ext === "mst" && $file === $variavel) {
                    $data['data'][$variavel] = file_get_contents(PATH_HOME . "public/tpl/{$tpl}");
                    break;
                }
            }
        }

        if (empty($data['data'][$variavel])) {
            foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                if (empty($data['data'][$variavel])) {
                    if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}")) {
                        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}") as $tpl) {
                            $ext = pathinfo($tpl, PATHINFO_EXTENSION);
                            $file = pathinfo($tpl, PATHINFO_FILENAME);
                            if ($ext === "mst" && $file === $variavel) {
                                $data['data'][$variavel] = file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}/{$tpl}");
                                break;
                            }
                        }
                    }
                    if (empty($data['data'][$variavel]) && file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl")) {
                        foreach (\Helpers\Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/tpl") as $tpl) {
                            $ext = pathinfo($tpl, PATHINFO_EXTENSION);
                            $file = pathinfo($tpl, PATHINFO_FILENAME);
                            var_dump($file);
                            if ($ext === "mst" && $file === $variavel) {
                                $data['data'][$variavel] = file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$tpl}");
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}