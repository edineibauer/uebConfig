<?php

$getRequests = [];
if (!empty($_SESSION['userlogin']['lastview'])) {
    $content = "";

    if (file_exists(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $_SESSION['userlogin']['setor'])) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $_SESSION['userlogin']['setor']) as $item) {
            if($item === "index.mustache" OR $item === "index.html" OR $item === "index.php" OR $item === $_SESSION['userlogin']['lastview'] . ".mustache" OR $item === $_SESSION['userlogin']['lastview'] . ".html" OR $item === $_SESSION['userlogin']['lastview'] . ".php") {
                $content = file_get_contents(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $_SESSION['userlogin']['setor'] . "/" . $item);
                break;
            } else {
                if(in_array(pathinfo($item, PATHINFO_EXTENSION), ["mustache", "html", "php"]))
                    $content = file_get_contents(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $_SESSION['userlogin']['setor'] . "/" . $item);
            }
        }
    } elseif (file_exists(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'])) {
        foreach (\Helpers\Helper::listFolder(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview']) as $item) {
            if($item === "index.mustache" OR $item === "index.html" OR $item === "index.php" OR $item === $_SESSION['userlogin']['lastview'] . ".mustache" OR $item === $_SESSION['userlogin']['lastview'] . ".html" OR $item === $_SESSION['userlogin']['lastview'] . ".php") {
                $content = file_get_contents(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $item);
                break;
            } else {
                if(in_array(pathinfo($item, PATHINFO_EXTENSION), ["mustache", "html", "php"]))
                    $content = file_get_contents(PATH_HOME . "public/view/" . $_SESSION['userlogin']['lastview'] . "/" . $item);
            }
        }
    }

    /**
     * Se encontrou a atual view do usuário, então procura por tags data-get com data-realtime-get
     */
    if (!empty($content)) {
        $prevRealtime = !1;
        $content = str_replace("'", '"', $content);
        foreach (explode('data-get="', $content) as $i => $getc) {
            if ($i > 0) {
                /**
                 * Tem data-realtime-get na declaração, busca por atualizações
                 */
                if (count(explode(' data-realtime-get', $getc)) > 1 or $prevRealtime) {
                    $get = explode('"', $getc)[0];

                    try {
                        $getDir = "";
                        if (file_exists(PATH_HOME . "public/get/" . $_SESSION['userlogin']['setor'] . "/" . $get . ".php")) {
                            $getDir = PATH_HOME . "public/get/" . $_SESSION['userlogin']['setor'] . "/" . $get . ".php";
                        } elseif (file_exists(PATH_HOME . "public/get/" . $get . ".php")) {
                            $getDir = PATH_HOME . "public/get/" . $get . ".php";
                        }

                        if (!empty($getDir)) {
                            ob_start();

                            unset($data);
                            include_once $getDir;
                            if (isset($data['data'])) {
                                $getRequests[$get] = $data['data'];
                            } else {
                                $getRequests[$get] = ob_get_contents();
                            }
                            ob_end_clean();
                        }

                    } catch (Exception $e) {
                        //não faz nada
                    }
                }
            }
            $prevRealtime = count(explode(' data-realtime-get', $getc)) > 1;
        }
    }
}

$data['data'] = $getRequests;