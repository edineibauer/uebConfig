<?php

$dados = filter_input_array(INPUT_POST, FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
unset($dados['maestruToken'], $dados['fileInSetFolder']);
$dados['id'] = $_SESSION['userlogin']['setorData']['id'];

/**
 * Update user data
 */
$data['data'] = \Entity\Entity::update($_SESSION['userlogin']['setor'], $dados);

/**
 * Salva perfil do usuário em last user profile in front to not update front user
 */
if(is_int($data['data'])) {
    foreach ($dados as $column => $value)
        $_SESSION['userlogin']['setorData'][$column] = $value;

    $f = fopen(PATH_HOME . "_cdn/userPerfil/" . $_SESSION['userlogin']['id'] . ".json", "w+");
    fwrite($f, json_encode($_SESSION['userlogin']));
    fclose($f);
}