<?php

$dataBefore = $data ?? [];

if(file_exists(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get")) {
    foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get") as $item) {
        $fileJsonGetSSE = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $item), !0);
        if($fileJsonGetSSE['haveUpdate'] == "1" && $fileJsonGetSSE['view'] === $_SESSION['userlogin']['lastview']) {

            /**
             * Update the content file with the new content
             */
            $fileJsonGetSSE['haveUpdate'] = "0";
            \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $fileJsonGetSSE['route'] . ".json", json_encode($fileJsonGetSSE));

            unset($data);

            $variaveis = $fileJsonGetSSE['variaveis'] ?? [];
            $_SESSION['db'] = [];
            ob_start();
            try {
                include $fileJsonGetSSE['path'];

                if (!empty($data['error'])) {
                    $data["response"] = 2;
                    $data["data"] = "";
                } elseif (!isset($data['data'])) {
                    $conteudo = ob_get_contents();
                    if (\Helpers\Check::isJson($conteudo))
                        $conteudo = json_decode($conteudo);

                    $data = ["response" => 1, "error" => "", "data" => $conteudo];
                } elseif (!isset($data['response'])) {
                    $data['response'] = 1;
                    $data['error'] = "";
                }

                if (is_string($data['data']) && preg_match('/^http/i', $data['data']))
                    $data = ["response" => 3, "error" => "", "data" => $data['data']];

            } catch (Error $e) {
                $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
            }
            ob_end_clean();

            /**
             * Update the content file with the new content
             */
            $fileJsonGetSSE['db'] = $_SESSION['db'];
            \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/" . $fileJsonGetSSE['route'] . ".json", json_encode($fileJsonGetSSE));

            $getSSE[$fileJsonGetSSE['route']] = json_encode($data);
        }
    }
}

$data = $dataBefore;