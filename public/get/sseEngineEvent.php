<?php

use Helpers\Helper;

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

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
    echo "id: " . time() . PHP_EOL;
    echo "retry: 1000" . PHP_EOL;

    returnMessagesSSE("db", $resultDb, $resultDbHistory);
    returnMessagesSSE("base", $messagesBase);

    if (!empty($getSSE))
        echo "event: get" . PHP_EOL . "data: " . json_encode($getSSE) . PHP_EOL . PHP_EOL;
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

                /**
                 * If update perfil, update all get on views too
                 */
                if ($view === "base" && $event === "updatePerfil" && file_exists(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get")) {
                    foreach (Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get") as $item) {
                        $c = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/{$item}"), !0);
                        $c['haveUpdate'] = 1;
                        \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/get/{$item}", json_encode($c));
                    }
                }
            }
        }
    }

    if (!empty($content))
        echo "event: " . $view . PHP_EOL . "data: " . json_encode($content) . PHP_EOL . PHP_EOL;
}

$messagesBase = [];
$resultDbHistory = [];
$resultDb = [];
$getSSE = [];

if (!empty($_SESSION['userlogin'])) {

    /**
     * Refresh login info in session
     */
    \Config\Config::setUser($_SESSION['userlogin']['token']);
    \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . '/my_data.json', json_encode($_SESSION['userlogin']));

    if (!file_exists(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse"))
        include 'sseMoveToListenner.php';

    /**
     * For each SSE on project
     */
    foreach (Helper::listFolder(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse") as $item) {
        $c = json_decode(file_get_contents(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse/{$item}"), !0);
        if ($c['haveUpdate'] == "1" || (!empty($c['rule']) && $c['rule'] === "*")) {

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

    try {
        include 'sseEngineGet.php';
        include 'sseEngineDb.php';
    } catch (Error $e) {
    }
}

returnSSE($messagesBase, $resultDb, $resultDbHistory, $getSSE);

// flush the output buffer and send echoed messages to the browser
while (ob_get_level() > 0)
    ob_end_flush();

flush();