<?php
$pass = \Helpers\Check::password(filter_input(INPUT_POST, 'pass', FILTER_DEFAULT));

$read = new \Conn\Read();
$read->exeRead("usuarios", "WHERE nome = 'Admin' AND status = 1 AND password = '{$pass}'");
if($read->getResult())
    new \Config\UpdateSystem();

$data['data'] = $read->getResult()? !0 : !1;