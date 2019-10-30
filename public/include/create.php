<?php

/**
 * @param array $dados
 * @return array
 */
function getServerConstants(array $dados)
{
    $localhost = ($_SERVER['SERVER_NAME'] === "localhost" ? true : false);
    $porta = $_SERVER['SERVER_PORT'];

    $dados['sitesub'] = "";
    $dados['dominio'] = ($localhost ? (in_array($porta, ["80", "8080"]) ? explode('/', $_SERVER['REQUEST_URI'])[1] : $porta) : explode('.', $_SERVER['SERVER_NAME'])[0]);
    $dados['ssl'] = isset($dados['protocol']) && $dados['protocol'];
    $dados['www'] = isset($dados['www']) && $dados['www'];
    $dados['home'] = "http" . ($dados['ssl'] ? "s" : "") . "://" .
        ($localhost ? "localhost/" : "") .
        ($localhost ? (in_array($porta, ["80", "8080"]) ? explode('/', $_SERVER['REQUEST_URI'])[1] : ":" . $porta) : $_SERVER['SERVER_NAME']) . "/";
    $dados['path_home'] = $_SERVER['DOCUMENT_ROOT'] . "/" . (!empty($dados['dominio']) && $localhost ? $dados['dominio'] . "/" : "");
    $dados['logo'] = (!empty($_FILES['logo']['name']) ? 'uploads/site/' . $_FILES['logo']['name'] : "");
    $dados['favicon'] = 'uploads/site/' . $_FILES['favicon']['name'];
    $dados['vendor'] = "libs/ueb/";
    $dados['version'] = "1.00";
    $dados['repositorio'] = "http://uebster.com/";
    $dados['homepage'] = 1;
    $dados['limitoffline'] = 50;
    $dados['serviceworker'] = !0;

    return $dados;
}

/**
 * Realiza validações de conexão ao banco de dados
 * @param array $dados
 * @return bool
 */
function requireConnectionDatabase(array $dados): bool
{
    include_once 'Conn.php';

    $test = new Conn($dados['host'], $dados['user'], $dados['pass'], $dados['database']);
    if ($test->databaseExist()) {
        //verifica se database esta vazia ou não
        if (!$test->databaseIsEmpty()) {
            //confirma com usuário se deseja apagar banco de dados

            if (isset($_SESSION['removeDatabase'])) {
                $test->clearDatabase();
                unset($_SESSION['removeDatabase']);
                return true;

            } else {
                echo "<h2 style='text-align:center;padding-top:30px;color:red'>"
                    . "Atenção! Esta base de dados já possui tabelas definidas!<p>Para continuar, a base de dados deve estar vazia.</p>"
                    . "</h2>"
                    . "<p style='text-align:center;padding-top:30px;'>Caso esses dados sejam importantes, faça um backup agora! Ou volte e escolha outra base de dados.</p>"
                    . "<p>"
                    . "<h3 style='text-align:center;padding-top:30px;font-weight: normal'>Para usar a Base de Dados <b>'{$dados['database']}'</b> e limpar seus dados. Basta Recarregar esta página!</h3>"
                    . "</p>";

                $_SESSION['removeDatabase'] = true;
                die;
            }

        } else {
            // tudo certo, continua
            return true;
        }

    } elseif ($test->credenciais()) {
        //create database e prossegue com a instalação
        $test->createDatabase();

        return true;
    } else {
        //credenciais inválidas
        return false;
    }
}

/**
 * Realiza uploads da logo e favicon
 */
function uploadFiles()
{
    if (!empty($_FILES['logo']['name']) && preg_match('/^image\//i', $_FILES['logo']['type']))
        move_uploaded_file($_FILES['logo']['tmp_name'], "../../../uploads/site/" . basename($_FILES['logo']['name']));

    if (preg_match('/^image\//i', $_FILES['favicon']['type']))
        move_uploaded_file($_FILES['favicon']['tmp_name'], "../../../uploads/site/" . basename($_FILES['favicon']['name']));
}

/**
 * Cria Arquivo de Rota e adiciona o atual domínio como uma rota alteranativa
 * @param array $dados
 */
function createRoute(array $dados)
{
    $data = json_decode(file_get_contents("public/installTemplates/route.json"), true);
    if (!empty($dados['dominio']) && !in_array($dados['dominio'], $data))
        $data[] = $dados['dominio'];

    Config\Config::writeFile("_config/route.json", json_encode($data));
}

/**
 * Cria Arquivo de Parâmetros Padrões do Sistema Singular
 * @param array $dados
 */
function createParam(array $dados)
{
    $data = json_decode(file_get_contents("public/installTemplates/param.json"), true);
    $data['title'] = $dados['sitename'];
    Config\Config::writeFile("_config/param.json", json_encode($data));
}

function getAccessFile()
{
    return '<Files "*.json">
            Order Deny,Allow
            Deny from all
        </Files>
        <Files "*.php">
            Order Deny,Allow
            Deny from all
        </Files>
        <Files "*.html">
            Order Deny,Allow
            Deny from all
        </Files>
        <Files "*.tpl">
            Order Deny,Allow
            Deny from all
        </Files>
        <Files "*.txt">
            Order Deny,Allow
            Deny from all
        </Files>';
}

if(!empty($dados['base'])) {
    $localhost = ($_SERVER['SERVER_NAME'] === "localhost" ? true : false);
    $porta = $_SERVER['SERVER_PORT'];

    $configuracoes = json_decode(file_get_contents($dados['base'] . "/public/_config/config.json"), !0);
    $configuracoes['dominio'] = ($localhost ? (in_array($porta, ["80", "8080"]) ? explode('/', $_SERVER['REQUEST_URI'])[1] : $porta) : explode('.', $_SERVER['SERVER_NAME'])[0]);
}

if (isset($configuracoes) || (!empty($dados['sitename']) && !empty($_FILES['favicon']['name']))) {

    $dados['database'] = strtolower(str_replace(['-', '_', ' '], '', $dados['database']));
    $dados['pre'] = strtolower(str_replace(['-', ' '], '_', $dados['pre']));

    session_start();
    if (requireConnectionDatabase($dados)) {
        if (isset($_SESSION['userlogin']))
            unset($_SESSION['userlogin']);

        $dados = getServerConstants($dados);

        include_once 'public/src/Config/Config.php';

        //Create Dir
        Config\Config::createDir("entity");
        Config\Config::createDir("entity/general");
        Config\Config::createDir("uploads");
        Config\Config::createDir("uploads/site");
        Config\Config::createDir("_config");
        Config\Config::createDir("_cdn");
        Config\Config::createDir("libs");
        Config\Config::createDir("public");
        Config\Config::createDir("public/view");
        Config\Config::createDir("public/set");
        Config\Config::createDir("public/get");
        Config\Config::createDir("public/api");
        Config\Config::createDir("public/overload");
        Config\Config::createDir("public/react");
        Config\Config::createDir("public/react/online");
        Config\Config::createDir("public/param");
        Config\Config::createDir("public/assets");
        Config\Config::createDir("public/dash");
        Config\Config::createDir("public/dash/admin");
        Config\Config::createDir("public/tpl");
        Config\Config::createDir("public/cron");
        Config\Config::createDir("public/entity");
        Config\Config::createDir("assetsPublic");
        Config\Config::createDir("assetsPublic/img");

        if(isset($configuracoes)) {
            $dados['sitename'] = empty($dados['sitename']) ? $configuracoes['sitename'] : $dados['sitename'];
            $dados['sitedesc'] = empty($dados['sitedesc']) ? $configuracoes['sitedesc'] : $dados['sitedesc'];
            $dados['sitesub'] = empty($dados['sitesub']) ? $configuracoes['sitesub'] : $dados['sitesub'];
            $dados['pre'] = $configuracoes['pre'];
            $dados['homepage'] = $configuracoes['homepage'];
            $dados['dominio'] = $configuracoes['dominio'];

            if (empty($_FILES['favicon']['name']) && !empty($configuracoes['favicon'])) {
                $dados['favicon'] = $configuracoes['favicon'];
                copy($dados['base'] . "/public/_config/favicon." . pathinfo($dados['favicon'])['extension'], $dados['path_home'] . "uploads/site/favicon." . pathinfo($dados['favicon'])['extension']);
            }

            if (empty($_FILES['logo']['name']) && !empty($configuracoes['logo'])) {
                $dados['logo'] = $configuracoes['logo'];
                copy($dados['base'] . "/public/_config/logo." . pathinfo($dados['logo'])['extension'], $dados['path_home'] . "uploads/site/logo." . pathinfo($dados['logo'])['extension']);
            }

            foreach ($configuracoes as $field => $value) {
                if (!in_array($field, ['sitename', 'sitedesc', 'sitesub', 'pre', 'homepage', 'favicon', 'logo', 'user', 'pass', 'database', 'host', 'dominio', 'ssl', 'www', 'home', 'path_home', 'vendor', 'version', 'repositorio']))
                    $dados[$field] = $value;
            }

            copy($dados['base'] . "/public/assets/theme.min.css", $dados['path_home'] . "public/assets/theme.min.css");
            copy($dados['base'] . "/public/_config/permissoes.json", $dados['path_home'] . "_config/permissoes.json");
            copy($dados['base'] . "/public/_config/route.json", $dados['path_home'] . "_config/route.json");
            copy($dados['base'] . "/public/_config/param.json", $dados['path_home'] . "_config/param.json");
            copy($dados['base'] . "/public/_config/general_info.json", $dados['path_home'] . "entity/general/general_info.json");
        } else {
            Config\Config::writeFile("_config/permissoes.json", "{}");
        }

        copy('public/assets/dino.png', "../../../uploads/site/dino.png");
        copy('public/assets/image-not-found.png', "../../../uploads/site/image-not-found.png");

        if(!empty($dados['base']))
            unset($dados['base']);

        uploadFiles();
        Config\Config::createConfig($dados);

        if(!isset($configuracoes)) {
            createRoute($dados);
            createParam($dados);
        }

        Config\Config::writeFile("index.php", file_get_contents("public/installTemplates/index.txt"));
        Config\Config::writeFile("image-convert.php", file_get_contents("public/installTemplates/image-convert.txt"));
        Config\Config::writeFile("apiGet.php", file_get_contents("public/installTemplates/apiGet.txt"));
        Config\Config::writeFile("apiSet.php", file_get_contents("public/installTemplates/apiSet.txt"));
        Config\Config::writeFile("apiView.php", file_get_contents("public/installTemplates/apiView.txt"));
        Config\Config::writeFile("apiApi.php", file_get_contents("public/installTemplates/apiApi.txt"));
        Config\Config::writeFile("apiApiPublic.php", file_get_contents("public/installTemplates/apiApiPublic.txt"));
        Config\Config::writeFile("public/view/index.php", file_get_contents("public/installTemplates/viewIndex.txt"));
        Config\Config::writeFile("public/param/index.json", file_get_contents("public/installTemplates/viewIndexParam.txt"));
        Config\Config::writeFile("public/assets/index.js", file_get_contents("public/installTemplates/viewIndexJs.txt"));
        Config\Config::writeFile("public/cron/index.php", str_replace('{$path_home}', $dados['path_home'], file_get_contents("public/installTemplates/cronIndex.txt")));
        Config\Config::writeFile("public/entity/-entity.json", '{"1":[],"2":[],"3":[],"0":[], "20":[]}');
        Config\Config::writeFile("public/dash/-menu.json", '{"1":[],"2":[],"3":[]}');
        Config\Config::writeFile("entity/general/general_info.json", "[]");
        Config\Config::writeFile("_config/.htaccess", "Deny from all");
        Config\Config::writeFile("entity/.htaccess", "Deny from all");
        Config\Config::writeFile("public/react/.htaccess", "Deny from all");
        Config\Config::writeFile("public/react/online/.htaccess", "Deny from all");
        Config\Config::writeFile("_cdn/.htaccess", "Deny from all");
        Config\Config::writeFile("public/api/.htaccess", "Deny from all");
        Config\Config::writeFile("vendor/.htaccess", getAccessFile());

        Config\Config::createHtaccess($dados['vendor'], $dados['dominio'], $dados['www'], $dados['ssl']);

        header("Location: ../../../updateSystem");
    } else {
        echo "<h3 class='container' style='text-align:center;padding-top:30px;color:red'>Credencias Inválidas! Erro ao se Comunicar com o Banco de Dados</h3>";
        require_once 'form.php';
    }
} else {
    echo "<h3 class='container' style='text-align:center;padding-top:30px;font-size: 20px;color: firebrick;'>Nome do Site e Ícone são obrigatórios!</h3>";
    require_once 'form.php';
}