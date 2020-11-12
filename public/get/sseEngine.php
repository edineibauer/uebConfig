<?php

$messagesBase = [];
$resultDbHistory = [];
$resultDb = [];
$getSSE = [];

if (!empty($_SESSION['userlogin'])) {
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}");

    /**
     * @param string $event
     * @param string $message
     */
    function writeUserSSE(string $event, string $message)
    {
        $f = fopen(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$event}.json", "w");
        fwrite($f, $message);
        fclose($f);
    }

    /**
     * @param array $messagesBase
     * @param array $resultDb
     * @param array $resultDbHistory
     * @param array $getSSE
     */
    function returnSSE(array $messagesBase, array $resultDb, array $resultDbHistory, array $getSSE)
    {
        $dados = [];
        $dados['db'] = returnMessagesSSE("db", $resultDb, $resultDbHistory);
        $dados['base'] = returnMessagesSSE("base", $messagesBase);
        $dados['get'] = $getSSE;

        return $dados;
    }

    /**
     * @param string $view
     * @param array $messages
     * @param array|null $messagesData
     */
    function returnMessagesSSE(string $view, array $messages, array $messagesData = null) {
        $content = [];
        foreach ($messages as $event => $message) {
            if (!file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$view}_{$event}.json")) {
                writeUserSSE($view . "_" . $event, $messagesData[$event] ?? json_encode($message));
                $content[$event] = $message;
            } else {
                $f = file_get_contents(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$view}_{$event}.json");
                $messageString = $messagesData[$event] ?? json_encode($message);
                if ($f !== $messageString) {
                    writeUserSSE($view . "_" . $event, $messageString);
                    $content[$event] = $message;
                }
            }
        }

        return $content;
    }

    /**
     * Refresh login info in session
     */
    \Config\Config::setUser($_SESSION['userlogin']['token']);

    /**
     * For each SSE on project
     */
    foreach (\Config\Config::getRoutesFilesTo("sse", "php") as $route) {
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

        $messagesBase[pathinfo($route, PATHINFO_FILENAME)] = $data;
    }

    include_once 'sseEngineDb.php';
    include_once 'sseEngineGet.php';
}

$data['data'] = returnSSE($messagesBase, $resultDb, $resultDbHistory, $getSSE);