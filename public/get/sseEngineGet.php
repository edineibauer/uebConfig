<?php

foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']) as $item) {
    if(preg_match("/^get_/i", $item)) {
        $file = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/" . $item), !0);

        ob_start();

        try {

            include_once $file['route'];

            if (!empty($data['error'])) {
                $data["response"] = 2;
                $data["data"] = "";
            } elseif (!isset($data['data'])) {
                $conteudo = ob_get_contents();
                if(\Helpers\Check::isJson($conteudo))
                    $conteudo = json_decode($conteudo);

                $data = ["response" => 1, "error" => "", "data" => $conteudo];
            } elseif (!isset($data['response'])) {
                $data['response'] = 1;
                $data['error'] = "";
            }

            if (is_string($data['data']) && preg_match('/^http/i', $data['data']))
                $data = ["response" => 3, "error" => "", "data" => $data['data']];

        } catch (Exception $e) {
            $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
        }

        ob_end_clean();

        if(json_encode($data) !== json_encode($file['content'])) {
            \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/" . $item, json_encode(["route" => $file['route'], "content" => $data]));
            $getSSE[$file['route']] = json_encode($data);
        }
    }
}