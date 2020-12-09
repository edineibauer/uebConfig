<?php

$dataBefore = $data ?? [];

foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']) as $item) {
    if (preg_match("/^get_{$_SESSION['userlogin']['lastview']}_/i", $item) && pathinfo($item, PATHINFO_EXTENSION) === "json") {
        $fileJsonGetSSE = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/" . $item), !0);

        unset($data);

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

        $nce = json_encode($data);
        $nc = base64_encode($nce);
        if ($nc !== $fileJsonGetSSE['content']) {

            /**
             * Update the content file with the new content
             */
            \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/" . $fileJsonGetSSE['route'] . ".json", json_encode(["route" => $fileJsonGetSSE['route'], "path" => $fileJsonGetSSE['path'], "content" => $nc]));

            $getSSE[$fileJsonGetSSE['route']] = $nce;
        }
    }
}

$data = $dataBefore;