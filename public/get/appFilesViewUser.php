<?php

$data['data'] = [];
$data['data']["view"] = [];

$setor = \Config\Config::getSetor();

$viewsLocked = [];
$views = [];
$dirViews = [];
foreach (\Config\Config::getRoutesTo("view") as $view) {
    if (!preg_match("/\/view\/{$setor}\/$/i", $view))
        $dirViews[] = $view;
}

if (!empty($dirViews)) {
    foreach ($dirViews as $fileDir) {
        foreach (\Helpers\Helper::listFolder($fileDir) as $dirViews) {
            if (is_dir($fileDir . $dirViews . "/" . $setor) && !in_array($dirViews, $viewsLocked)) {
                $offline = !1;
                $viewPath = "";

                /**
                 * Check files in view to validate that have a view and is offline parameter
                 */
                foreach (\Helpers\Helper::listFolder($fileDir . $dirViews . "/" . $setor) as $view) {
                    $extensao = pathinfo($view, PATHINFO_EXTENSION);
                    if (in_array($extensao, ["html", "php"]) && empty($viewPath)) {
                        $viewPath = $dirViews;
                    } elseif ($extensao === "json" && !isset($view[$dirViews])) {
                        $param = json_decode(file_get_contents($fileDir . $dirViews . "/" . $setor . "/" . $view), !0);
                        if (!$offline && !empty($param) && !empty($param['offline']) && $param['offline'])
                            $offline = !0;
                    }
                }

                /**
                 * if is offline and have view, so add it
                 */
                if ($offline && !empty($viewPath))
                    $views[] = $dirViews;

                $viewsLocked[] = $dirViews;
            }
        }
    }

    $data['data']['view'] = array_values($views);
}

