<?php

$data['data'] = [];
$setor = \Config\Config::getSetor();
$templatesSystem = ["header", "aside", "menuHeader", "installAppCard"];

foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/assets/core/tpl") as $item) {
    if(pathinfo($item, PATHINFO_EXTENSION) === "mustache")
        $templatesSystem[] = pathinfo($item, PATHINFO_FILENAME);
}

foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/assets/core") as $item) {
    $ext = pathinfo($item, PATHINFO_EXTENSION);
    if($ext === "json") {
        $j = json_decode(file_get_contents(PATH_HOME . "public/assets/core/" . $item), !0);
        if(!empty($j['template'])) {
            if(is_string($j['template'])) {
                $templatesSystem[] = $j['template'];
            } elseif(is_array($j['template'])) {
                foreach ($j['template'] as $tt) {
                    if(is_string($tt))
                        $templatesSystem[] = $tt;
                }
            }
        } elseif(!empty($j['templates'])) {
            if(is_string($j['templates'])) {
                $templatesSystem[] = $j['templates'];
            } elseif(is_array($j['templates'])) {
                foreach ($j['templates'] as $tt) {
                    if(is_string($tt))
                        $templatesSystem[] = $tt;
                }
            }
        }

    } elseif($ext === "mustache") {
        $templatesSystem[] = pathinfo($item, PATHINFO_FILENAME);
    }
}

foreach (\Config\Config::getRoutesFilesTo("tpl", "mustache") as $tpl => $tplDir) {
    $tplName = str_replace('.mustache', '', $tpl);
    if (in_array($tplName, $templatesSystem) && !isset($data['data'][$tplName]))
        $data['data'][$tplName] = file_get_contents($tplDir);
}