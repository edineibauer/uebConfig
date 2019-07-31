<?php

/**
 * Carrega os Arquivos bases de paginas para este usuário
 */

/**
 * Obtém os dados do diretório para consumo do usuário
 * @param string $path
 * @param array $dados
 * @param string $domain
 * @return array
 */
function getCurrentCachedContent(string $path, array $dados, string $domain): array
{
    if (file_exists(PATH_HOME . "{$path}/view/{$domain}.php"))
        $dados['view'][] = HOME . "view/" . $domain;

    return $dados;
}

// return values
$data['data'] = [
    "view" => []
];

if (!empty($link->getVariaveis())) {
    $domain = "";
    foreach (array_reverse($link->getVariaveis()) as $variavel) {
        if ($variavel !== DOMINIO)
            $domain .= (!empty($domain) ? "/" : "") . $variavel;
    }
    if (empty($domain))
        $domain = "index";
} else {
    $domain = "index";
}

// public content
$data['data'] = getCurrentCachedContent('public', $data['data'], $domain);

// libs content
foreach (\Config\Config::getViewPermissoes() as $rota) {
    if (file_exists(PATH_HOME . VENDOR . $rota . "/public") && !in_array($rota, ['entity-ui', 'dev-ui', 'config', 'form']))
        $data['data'] = getCurrentCachedContent(VENDOR . $rota . '/public', $data['data'], $domain);
}