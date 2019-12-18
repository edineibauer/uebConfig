<?php

use Helpers\Check;
use Helpers\Helper;

$name = filter_input(INPUT_POST, 'view_name', FILTER_DEFAULT);
$html = filter_input(INPUT_POST, 'html', FILTER_DEFAULT);
$css = filter_input(INPUT_POST, 'css', FILTER_DEFAULT);
$cssLink = filter_input(INPUT_POST, 'links_externos_css', FILTER_DEFAULT);
$js = filter_input(INPUT_POST, 'javascript', FILTER_DEFAULT);
$jsLink = filter_input(INPUT_POST, 'links_externos_js', FILTER_DEFAULT);
$midias = filter_input(INPUT_POST, 'midias', FILTER_DEFAULT);
$fonts = filter_input(INPUT_POST, 'fonts', FILTER_DEFAULT);
$param = [
    'title' => filter_input(INPUT_POST, 'titulo_da_pagina', FILTER_DEFAULT) ?? '"{$sitename}"',
    'header' => filter_input(INPUT_POST, 'utilizar_cabecalho', FILTER_VALIDATE_BOOLEAN),
    'navbar' => filter_input(INPUT_POST, 'utilizar_navbar', FILTER_VALIDATE_BOOLEAN),
    'css' => [],
    'js' => [],
    'fonts' => []
];
$cssContent = "";
$jsContent = "";

if (!empty($html) && Check::isJson($html))
    $html = file_get_contents(json_decode($html, !0)[0]['url']);

if (!empty($css) && Check::isJson($css))
    $css = json_decode($css, !0);

if (!empty($cssLink) && Check::isJson($cssLink))
    $cssLink = json_decode($cssLink, !0);

if (!empty($jsLink) && Check::isJson($jsLink))
    $jsLink = json_decode($jsLink, !0);

if (!empty($js) && Check::isJson($js))
    $js = json_decode($js, !0);

if (!empty($midias) && Check::isJson($midias))
    $midias = json_decode($midias, !0);

if (!empty($fonts) && Check::isJson($fonts))
    $fonts = json_decode($fonts, !0);

Helper::createFolderIfNoExist(PATH_HOME . "public/assets/view");
Helper::createFolderIfNoExist(PATH_HOME . "public/assets/view/" . $name);

/**
 * Troca as referências de mídia no HTML CSS e JS pelas referências no projeto final
 * @param string $midia
 * @param string $url
 * @param string $html
 * @param string $cssContent
 * @param string $jsContent
 * @return array
 */
function changeMidia(string $midia, string $url, string $html, string $cssContent, string $jsContent) {

    //troca midia no HTML
    $changes = explode($midia, $html);
    if (count($changes) > 1) {
        foreach ($changes as $i => $change) {
            if (!empty($change) && count($changes) -1 > $i) {
                $link = explode('"', str_replace("'", '"', $change));
                if(count($link) > 1) {
                    $link = $link[count($link) - 1] . $midia;
                    $html = str_replace($link, HOME . $url, $html);
                    $cssContent = str_replace($link, HOME . $url, $cssContent);
                    $jsContent = str_replace($link, HOME . $url, $jsContent);
                }
            }
        }
    }

    //troca midia no CSS
    $changes = explode($midia, $cssContent);
    if (count($changes) > 1) {
        foreach ($changes as $i => $change) {
            if (!empty($change) && count($changes) -1 > $i) {
                $link = explode('"', str_replace("'", '"', $change));
                $link2 = explode('(', $change);
                if(count($link) > 1) {
                    $link = $link[count($link) - 1] . $midia;
                    $cssContent = str_replace($link, HOME . $url, $cssContent);
                }
                if(count($link2) > 1) {
                    $link = $link2[count($link2) - 1] . $midia;
                    $cssContent = str_replace($link, HOME . $url, $cssContent);
                }
            }
        }
    }

    //troca midia no JS
    $changes = explode($midia, $jsContent);
    if (count($changes) > 1) {
        foreach ($changes as $i => $change) {
            if (!empty($change) && count($changes) -1 > $i) {
                $link = explode('"', str_replace("'", '"', $change));
                if(count($link) > 1) {
                    $link = $link[count($link) - 1] . $midia;
                    $jsContent = str_replace($link, HOME . $url, $jsContent);
                }
            }
        }
    }

    return [$html, $cssContent, $jsContent];
}

/**
 * @param string $urlOnline
 * @param string $name
 * @return string
 */
function getCss(string $urlOnline, string $name): string
{
    try {
        Helper::createFolderIfNoExist(PATH_HOME . "public/assets/fonts");
        $data = @file_get_contents($urlOnline);
        $urlSplit = explode("/", $urlOnline);
        $baseUrl = preg_match("/^(http|\/\/)/i", $urlOnline) ? "//" . $urlSplit[2] . "/" : "";

        foreach (explode('url(', $data) as $i => $u) {
            if ($i > 0) {
                $url = explode(')', $u)[0];
                $urlFixed = $url;
                $urlName = "public/assets/fonts/" . pathinfo($url, PATHINFO_BASENAME);

                //faz a troca de navegação de pastas para trás da url
                if(preg_match("/^..\//i", $url)) {
                    $urlFolder = pathinfo($urlOnline, PATHINFO_DIRNAME);
                    $urlFolderSplit = explode("/", $urlFolder);
                    $urlFolder .= "/";
                    $totalSplit = count($urlFolderSplit);

                    foreach (array_keys(explode("../", $url)) as $iii) {
                        if($iii > 0)
                            $urlFolder = str_replace($urlFolderSplit[$totalSplit - $iii] . "/", "", $urlFolder);
                    }

                    $urlFixed = $urlFolder . str_replace("../", "", $url);
                } elseif(preg_match("/^.\//i", $url)) {
                    $urlFixed = str_replace("./", $baseUrl, $url);
                }

                if(!file_exists(PATH_HOME . $urlName)) {
                    $urlData = @file_get_contents($urlFixed);
                    if ($urlData) {
                        $f = fopen(PATH_HOME . $urlName, "w+");
                        fwrite($f, $urlData);
                        fclose($f);

                        $data = str_replace($url, HOME . $urlName . "?v=" . VERSION, $data);
                    } else {
                        $before = "@font-face" . explode("@font-face", $u[$i - 1])[1] . "url(";
                        $after = explode("}", $u)[0];
                        $data = str_replace($before . $after, "", $data);
                    }
                } else {
                    $data = str_replace($url, HOME . $urlName . "?v=" . VERSION, $data);
                }
            }
        }

        return $data;

    } catch (Exception $e) {
        return "";
    }
}

/**
 * Cria view file
 */
$f = fopen(PATH_HOME . "public/view/" . $name . ".php", "w+");
fwrite($f, "<div id='core-content-view' style='float: left;width: 100%'></div>");
fclose($f);

/**
 * Cria CSS file
 */
$mCss = new MatthiasMullie\Minify\CSS("");
if (!empty($css)) {
    foreach ($css as $c)
        $mCss->add(file_get_contents($c['url']));
}

if (!empty($cssLink)) {
    foreach ($cssLink as $c)
        $mCss->add(getCss($c['link'], $name));
}

$cssContent = $mCss->minify();

/**
 * Cria JS file
 */
$mJs = new MatthiasMullie\Minify\JS("");
if (!empty($js)) {
    foreach ($js as $c) {
        $mJs->add(file_get_contents($c['url']));
    }
}

if (!empty($jsLink)) {
    foreach ($jsLink as $c)
        $mJs->add(file_get_contents($c['link'], $name));
}

$jsContent = $mJs->minify();

/**
 * Cria Midias
 */
if (!empty($midias)) {
    foreach ($midias as $midia) {
        $url = "public/assets/view/" . $name . "/" . $midia['name'] . "." . $midia['type'];
        copy($midia['url'], PATH_HOME . $url);

        /**
         * Atualiza links da mídia em HTML, CSS e JS
         */
        if($midia['type'] === "webp") {
            foreach (["png", "jpg", "jpeg", "gif", "bmp", "svg"] as $type)
                list($html, $cssContent, $jsContent) = changeMidia($midia['name'] . "." . $type, $url, $html, $cssContent, $jsContent);
        } else {
            list($html, $cssContent, $jsContent) = changeMidia($midia['name'] . "." . $midia['type'], $url, $html, $cssContent, $jsContent);
        }
    }
}

/**
 * Cria Fonts
 */
if (!empty($fonts)) {
    Helper::createFolderIfNoExist(PATH_HOME . "public/assets/view/" . $name . "/fonts");
    foreach ($fonts as $f) {
        copy($f['url'], PATH_HOME . "public/assets/view/" . $name . "/fonts/" . $f['name'] . $f['type']);

        $param['fonts'][] = HOME . "assets/view/" . $name . "/fonts/" . $f['name'] . $f['type'];
    }
}

/**
 * Cria param file
 */
$f = fopen(PATH_HOME . "public/param/" . $name . ".json", "w+");
fwrite($f, json_encode($param));
fclose($f);


/**
 * Cria tpl file
 */
$f = fopen(PATH_HOME . "public/tpl/view" . ucfirst($name) . ".mustache", "w+");
fwrite($f, $html);
fclose($f);

/**
 * Cria CSS
 */
$f = fopen(PATH_HOME . "public/assets/" . $name . ".css", "w+");
fwrite($f, $cssContent);
fclose($f);

/**
 * Cria JS
 */
$jsContent .= ";$(function(){ $('#core-content-view').htmlTemplate('view" . ucfirst($name) . "', {}); });";
$f = fopen(PATH_HOME . "public/assets/" . $name . ".js", "w+");
fwrite($f, $jsContent);
fclose($f);