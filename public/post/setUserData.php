<?php

$dados = filter_input_array(INPUT_POST, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
unset($dados['maestruToken'], $dados['fileInSetFolder']);
$dados['id'] = $_SESSION['userlogin']['setorData']['id'];

/**
 * Update user data
 */
$data['data'] = \Entity\Entity::update($_SESSION['userlogin']['setor'], $dados);