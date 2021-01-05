<?php

/**
 * copy all sse to listenner on _cdn
 */
foreach (\Config\Config::getRoutesFilesTo("sse", "php") as $sse => $path) {
    $name = str_replace(".php", "", $sse);
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE");
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id']);
    \Helpers\Helper::createFolderIfNoExist(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse");
    \Config\Config::createFile(PATH_HOME . "_cdn/userSSE/" . $_SESSION['userlogin']['id'] . "/sse/" .$name . ".json", json_encode(["route" => $name, "path" => $path, "haveUpdate" => "1"]));
}

/**
 * Set all get on _cdn to haveUpdate = 1
 */
$getPath = PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/get";
if (file_exists($getPath)) {
    foreach (\Helpers\Helper::listFolder($getPath) as $getItem) {
        $c = json_decode(file_get_contents($getPath . "/{$getItem}"), !0);
        $c['haveUpdate'] = "1";
        \Config\Config::createFile($getPath . "/{$getItem}", json_encode($c));
    }
}