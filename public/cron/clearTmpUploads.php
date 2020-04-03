<?php

foreach (Helpers\Helper::listFolder(PATH_HOME . "uploads/tmp") as $item) {
    $time = strtotime('+1 day', filemtime(PATH_HOME . "uploads/tmp/{$item}"));
    $hoje = strtotime('now');

    if($time < $hoje)
        unlink(PATH_HOME . "uploads/tmp/{$item}");
}