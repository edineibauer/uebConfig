<?php

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$messages = [];
if (!empty($_SESSION['userlogin'])) {

    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");

    function writeUserSSE(string $event, string $message) {
        $f = fopen(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$event}.json", "w");
        fwrite($f, $message);
        fclose($f);

        echo "event: " . $event . PHP_EOL . "data: " . $message . PHP_EOL . PHP_EOL;
    }

    function returnSSE($messages)
    {
        echo "id: " . time() . PHP_EOL;
        echo "retry: 1000" . PHP_EOL;
        foreach ($messages as $event => $message) {
            if(!file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$event}.json")) {
                writeUserSSE($event, $message);
            } else {
                $f = file_get_contents(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$event}.json");
                if($f !== $message)
                    writeUserSSE($event, $message);
            }
        }
        ob_flush();
        flush();
    }

    if(!empty($_SESSION['userlogin']['id'])) {
        $view = file_get_contents(PATH_HOME . "_cdn/userLastView/" . $_SESSION['userlogin']['id'] . ".txt");

        foreach (\Config\Config::getRoutesFilesTo("view/{$view}/sse") as $route) {
            $data = null;

            ob_start();

            try {
                include_once $route;
                if (!empty($data['error'])) {
                    $data["response"] = 2;
                    $data["data"] = "";
                } elseif (!isset($data['data'])) {
                    $data = ["response" => 1, "error" => "", "data" => ob_get_contents()];
                } elseif (!isset($data['response'])) {
                    $data['response'] = 1;
                    $data['error'] = "";
                }

            } catch (Exception $e) {
                $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
            }

            ob_end_clean();

            $messages[pathinfo($route, PATHINFO_FILENAME)] = json_encode($data);
        }
    }
}

returnSSE($messages);