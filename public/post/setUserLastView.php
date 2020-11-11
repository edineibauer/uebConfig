<?php

$v = trim(strip_tags(filter_input(INPUT_POST, 'v', FILTER_DEFAULT)));

$sql = new \Conn\SqlCommand();
$sql->exeCommand("UPDATE " . PRE . "usuarios SET lastview='{$v}' WHERE id = {$_SESSION['userlogin']['id']}");