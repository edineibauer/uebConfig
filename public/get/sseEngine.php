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
    function returnMessagesSSE(string $view, array $messages, array $messagesData = null)
    {
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

    if (!empty($_SESSION['userlogin'])) {

        /**
         * Find all SSE on projet to add on listenner
         */
        include_once 'sseMoveToListenner.php';

        /**
         * For each SSE on project
         */
        if (file_exists(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse")) {

            /**
             * Refresh login info in session
             */
            \Config\Config::setUser($_SESSION['userlogin']['token']);

            foreach (\Helpers\Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse") as $item) {
                $c = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse/{$item}"), !0);
                if ($c['haveUpdate'] === "1" || (!empty($c['rule']) && $c['rule'] === "*")) {

                    /**
                     * Update the sse with no update pendent
                     */
                    $c['haveUpdate'] = "0";
                    \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse/" . $c['route'] . ".json", json_encode($c));
                    $data = ["response" => 1, "error" => "", "data" => ""];

                    ob_start();

                    try {

                        $_SESSION['sseRule'] = 'db';
                        $_SESSION['sseAction'] = ['create', 'update', 'delete'];
                        $_SESSION['db'] = [];

                        include $c['path'];
                        if (!empty($data['error'])) {
                            $data["response"] = 2;
                            $data["data"] = "";
                        } elseif (!isset($data['data'])) {
                            $data = ["response" => 1, "error" => "", "data" => ob_get_contents()];
                        } elseif (!isset($data['response'])) {
                            $data['response'] = 1;
                            $data['error'] = "";
                        }

                    } catch (Error $e) {
                        $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
                    }

                    ob_end_clean();

                    /**
                     * Update the sse with no update pendent
                     */
                    $c['action'] = $_SESSION['sseAction'] ?? "";
                    $c['rule'] = $_SESSION['sseRule'] ?? '*';
                    $c['db'] = $_SESSION['db'];
                    unset($_SESSION['sseRule'], $_SESSION['sseAction']);

                    \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse/" . $c['route'] . ".json", json_encode($c));

                    $messagesBase[$c['route']] = $data;
                }
            }
        }

        try {
//            include 'sseEngineDb.php';
            include 'sseEngineGet.php';
        } catch (Error $e) {
            $data = ["response" => 2, "error" => "Erro na resposta do Servidor", "data" => ""];
        }
    }
}

$data['data'] = returnSSE($messagesBase, $resultDb, $resultDbHistory, $getSSE);