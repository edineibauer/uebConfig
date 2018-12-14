<?php

$conf = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
$conf['sitename'] = $dados['nome_do_site'];
$conf['sitesub'] = $dados['subtitulo'];
$conf['sitedesc'] = $dados['descricao'];
$conf['ssl'] = $dados['HTTPS'];
$conf['www'] = $dados['www'];
$conf['logo'] = (!empty($dados['logo']) ? json_decode($dados['logo'], true)[0]['url'] : "");
$conf['favicon'] = (!empty($dados['favicon']) ? json_decode($dados['favicon'], true)[0]['url'] : "");
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
