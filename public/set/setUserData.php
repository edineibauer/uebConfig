<?php

$dados = filter_input(INPUT_POST, 'data', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);
$dados['id'] = $_SESSION['userlogin']['setorData']['id'];
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