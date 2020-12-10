<?php

$data['data'] = $_SESSION['userlogin']['setor'] === "admin";

if(!$data['data']) {
    $pass = \Helpers\Check::password(filter_input(INPUT_POST, 'pass', FILTER_DEFAULT));
    $read = new \Conn\Read();
    $read->exeRead("usuarios", "WHERE setor IS NULL && status = 1 && password = '{$pass}'");
    $data['data'] = $read->getResult() ? !0 : !1;
}

/**
 * Update the class UpdateSystem, then execute
 */
if($data['data'])
    new \Config\UpdateSystem();