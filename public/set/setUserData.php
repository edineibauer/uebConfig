<?php

$dados = filter_input(INPUT_POST, 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
$dados['id'] = $_SESSION['userlogin']['setorData']['id'];
$data['data'] = \Entity\Entity::update($_SESSION['userlogin']['setor'], $dados);