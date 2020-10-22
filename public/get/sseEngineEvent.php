<?php

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

$messages = [];
$messagesBase = [];
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
     * @param string $view
     * @param array $messages
     * @param array $messagesBase
     * @param array $resultDb
     * @param array $resultDbHistory
     */
    function returnSSE(string $view, array $messages, array $messagesBase, array $resultDb, array $resultDbHistory)
    {
        echo "id: " . time() . PHP_EOL;
        echo "retry: 1000" . PHP_EOL;
        returnMessagesSSE("db", $resultDb, $resultDbHistory);
        returnMessagesSSE($view, $messages);
        returnMessagesSSE("base", $messagesBase);
        ob_flush();
        flush();
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

        if (!empty($content))
            echo "event: " . $view . PHP_EOL . "data: " . json_encode($content) . PHP_EOL . PHP_EOL;
    }

    /**
     * For each SSE on each view
     */
    foreach (\Config\Config::getRoutesTo("view") as $folderView) {
        foreach (\Helpers\Helper::listFolder($folderView) as $view) {

            /**
             * For each SSE on a view
             */
            foreach (\Config\Config::getRoutesFilesTo("view/{$view}/{$_SESSION['userlogin']['setor']}/sse", "php") as $route) {
                if (!isset($messages[pathinfo($route, PATHINFO_FILENAME)])) {
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

                    $messages[pathinfo($route, PATHINFO_FILENAME)] = $data;
                }
            }
            foreach (\Config\Config::getRoutesFilesTo("view/{$view}/sse", "php") as $route) {
                if (!isset($messages[pathinfo($route, PATHINFO_FILENAME)])) {
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

                    $messages[pathinfo($route, PATHINFO_FILENAME)] = $data;
                }
            }
        }
    }

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

    $resultDbHistory = [];
    $resultDb = [];
    include_once 'sseEngineDb.php';
}

returnSSE($_SESSION['userlogin']['lastView'] ?? "", $messages, $messagesBase, $resultDb, $resultDbHistory);
die;