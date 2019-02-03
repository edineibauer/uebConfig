<?php
$dados = filter_input(INPUT_POST, 'dados', FILTER_DEFAULT, FILTER_REQUIRE_ARRAY);

$conf = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
$conf['sitename'] = $dados['nome_do_site'];
$conf['sitesub'] = $dados['subtitulo'];
$conf['sitedesc'] = $dados['descricao'];
$conf['ssl'] = $dados['HTTPS'];
$conf['www'] = $dados['www'];
$conf['logo'] = (!empty($dados['logo']) ? $dados['logo'][0]['image'] : "");
$conf['favicon'] = (!empty($dados['favicon']) ? $dados['favicon'][0]['image'] : HOME . "image/" . VENDOR . "config/public/assets/favicon.png");
$conf['home'] = HOME;

if ($dados['www'] && !WWW)
    $conf['home'] = str_replace('://', '://www.', HOME);
elseif (!$dados['www'] && WWW)
    $conf['home'] = str_replace('://www.', '://', HOME);

if ($dados['HTTPS'] && !SSL)
    $conf['home'] = str_replace('http://', 'https://', HOME);
elseif (!$dados['HTTPS'] && SSL)
    $conf['home'] = str_replace('https://', 'http://', HOME);

\Config\Config::createConfig($conf);
$up = new \Config\updateSystem(['manifest']);

$data['data'] = 1;