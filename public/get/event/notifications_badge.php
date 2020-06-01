<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');

if(!empty($_SESSION['userlogin'])) {

    function sendMsg($id, $msg)
    {
        echo "id: $id" . PHP_EOL;
        echo "data: $msg" . PHP_EOL;
        echo PHP_EOL;
        ob_flush();
        flush();
    }

    $sql = new \Conn\SqlCommand();
    $sql->exeCommand("SELECT count(id) as total FROM " . PRE . "notifications_report WHERE usuario = {$_SESSION['userlogin']['id']} && (recebeu IS NULL || recebeu = 0)");
    sendMsg(time(), $sql->getResult()[0]['total']);
}