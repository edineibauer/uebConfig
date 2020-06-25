<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

require_once './_config/config.php';
$_SESSION = [];

\Config\Config::setUser(filter_input(INPUT_POST, 'maestruToken', FILTER_DEFAULT));

$data = ['error' => "", "data" => "", "response" => 1];

$fileInSetFolder = filter_input(INPUT_POST, 'fileInSetFolder', FILTER_DEFAULT) . ".php";

if(isset($_POST['fileInSetFolder']))
    unset($_POST['fileInSetFolder']);
if(isset($_POST['maestruToken']))
    unset($_POST['maestruToken']);

$find = !1;
foreach (\Config\Config::getRoutesFilesTo("set", "php") as $file => $dir) {
    $fileInFindSetor = explode("/public/set/", $dir)[1];
    if($fileInFindSetor === $fileInSetFolder) {
        $find = !0;
        ob_start();
        include_once $dir;
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

        break;
    }
}

if(!$find)
    $data = ['error' => "Arquivo {$fileInSetFolder} não encontrado nas pastas `public/set/`", "data" => "", "response" => 2];

echo json_encode($data);
