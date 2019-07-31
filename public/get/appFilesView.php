<?php

/**
 * Carrega os Arquivos bases de paginas e assets para este usuário
 */

use \Helpers\Helper;

/**
 * Obtém os dados do diretório para consumo do usuário
 * @param string $path
 * @param array $dados
 * @return array
 */
function getCachedContent(string $path, array $dados): array
{
    //views
    if (file_exists(PATH_HOME . "{$path}/view")) {
        foreach (Helper::listFolder(PATH_HOME . "{$path}/view") as $view) {
            $viewUrl = HOME . "view/" . str_replace('.php', '', $view);

            if (preg_match('/\.php$/i', $view) && $view !== "updateSystem.php" && !in_array($viewUrl, $dados['view']))
                $dados['view'][] = $viewUrl;
        }
    }

    return $dados;
}

// return values
$data['data'] = [
    "view" => []
];

// public content
$data['data'] = getCachedContent('public', $data['data']);

// libs content
foreach (\Config\Config::getViewPermissoes() as $rota) {
    if (file_exists(PATH_HOME . VENDOR . $rota . "/public") && !in_array($rota, ['entity-ui', 'dev-ui']))
        $data['data'] = getCachedContent(VENDOR . $rota . '/public', $data['data']);
}