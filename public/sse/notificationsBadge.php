<?php

if(!empty($_SESSION['userlogin']) && $_SESSION['userlogin']['id'] > 0) {
    $sql = new \Conn\SqlCommand();
    $sql->exeCommand("SELECT count(id) as total FROM " . PRE . "notifications_report WHERE usuario = {$_SESSION['userlogin']['id']} && (recebeu IS NULL || recebeu = 0)");
    $data['data'] = $sql->getResult()[0]['total'];
}