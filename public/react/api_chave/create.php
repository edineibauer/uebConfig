<?php

$chave = md5(rand(999999, 9999999) . time());

$up = new \Conn\Update();
$up->exeUpdate("api_chave", ['chave' => $chave], "WHERE id = :id", "id={$dados['id']}");