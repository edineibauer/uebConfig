<?php

$getPath = PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}";
if (file_exists($getPath)) {
    foreach (\Helpers\Helper::listFolder($getPath) as $sseItem) {
        if(is_file($getPath . "/" . $sseItem))
            unlink($getPath . "/" . $sseItem);
    }
}