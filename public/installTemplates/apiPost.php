<?php

header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Origin: http://localhost:8000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once './_config/config.php';

$_SESSION = [];
$data = ['error' => "", "data" => "", "response" => 1];

\Config\Config::setUser(filter_input(INPUT_POST, 'maestruToken', FILTER_DEFAULT));
$fileInSetFolder = filter_input(INPUT_POST, 'fileInSetFolder', FILTER_DEFAULT) . ".php";

if(isset($_POST['fileInSetFolder']))
    unset($_POST['fileInSetFolder']);
if(isset($_POST['maestruToken']))
    unset($_POST['maestruToken']);

$urlInclude = null;
foreach (\Config\Config::getRoutesFilesTo("post") as $file => $dir) {
    $fileInFindSetor = explode("/public/post/", $dir)[1];
    if($fileInFindSetor === $fileInSetFolder) {
        $urlInclude = $dir;
        break;
    }
}

/**
 * Search on all view get folders
 */
if(!$urlInclude) {
    $setor = \Config\Config::getSetor();
    foreach (\Config\Config::getRoutesTo("view") as $v) {
        foreach (\Helpers\Helper::listFolder($v) as $vv) {
            foreach (\Config\Config::getRoutesFilesTo("view/{$vv}/{$setor}/post", "php") as $vvv) {
                if(explode("view/{$vv}/{$setor}/post/", $vvv)[1] === $fileInSetFolder) {
                    $urlInclude = $vvv;
                    break;
                }
            }
            foreach (\Config\Config::getRoutesFilesTo("view/{$vv}/post", "php") as $vvv) {
                if(explode("view/{$vv}/post/", $vvv)[1] === $fileInSetFolder) {
                    $urlInclude = $vvv;
                    break;
                }
            }
        }
    }
}

if(!empty($urlInclude)) {
    ob_start();
    include_once $urlInclude;
    $result = ob_get_contents();
    ob_end_clean();

    if (!empty($result)) {
        if(!empty($result['response']) && $data['response'] === 2 && empty($data['error']))
            $data['error'] = $data;
        elseif(!empty($result['error']))
            $data['response'] = 2;
        else
            $data['data'] = (!empty($result['data']) ? $result['data'] : $result);
    }
} else {
    $data = ['error' => "Arquivo {$fileInSetFolder} não encontrado nas pastas `public/post/`", "data" => "", "response" => 2];
}

echo json_encode($data);
