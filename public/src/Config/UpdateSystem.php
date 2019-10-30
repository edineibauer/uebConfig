<?php

namespace Config;

use EntityUi\EntityCreateEntityDatabase;
use Helpers\Helper;
use Conn\Read;
use Conn\SqlCommand;
use Entity\Entity;
use MatthiasMullie\Minify;

class UpdateSystem
{
    private $result;

    /**
     * UpdateSystem constructor.
     * @param array $custom
     */
    public function __construct(array $custom = [])
    {
        $this->start($custom);
    }

    /**
     * @return mixed
     */
    public function getResult()
    {
        return $this->result;
    }

    /**
     * @param array $custom
     */
    private function start(array $custom)
    {
        if (file_exists(PATH_HOME . "composer.lock")) {
            $this->createJsonConfigFileIfNotExist();

            if (!file_exists(PATH_HOME . "_config/updates/version.txt")) {

                //check if is the first time in the system to clear database
                if (!file_exists(PATH_HOME . "entity/cache")) {
                    //nenhuma entidade, zera banco
                    $sql = new SqlCommand();
                    $sql->exeCommand("SHOW TABLES");
                    if ($sql->getResult()) {
                        $sqlDelete = new SqlCommand();
                        foreach ($sql->getResult() as $item) {
                            if (!empty($item['Tables_in_' . DATABASE]))
                                $sqlDelete->exeCommand("DROP TABLE IF EXISTS " . $item['Tables_in_' . DATABASE]);
                        }
                    }
                }

                //Cria Version config file
                Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
                $f = fopen(PATH_HOME . "_config/updates/version.txt", "w");
                fwrite($f, file_get_contents(PATH_HOME . "composer.lock"));
                fclose($f);

                $this->updateVersionNumber();
                $this->updateVersion($custom);

            } elseif (file_exists(PATH_HOME . "_config/updates/version.txt")) {
                $keyVersion = file_get_contents(PATH_HOME . "composer.lock");
                $old = file_get_contents(PATH_HOME . "_config/updates/version.txt");
                if (!empty($custom) || $old !== $keyVersion) {
                    $this->updateVersionNumber();
                    $this->updateVersion($custom);
                }
            }
        }
    }

    /**
     * Cria arquivo de configurações json se não existir
     */
    private function createJsonConfigFileIfNotExist()
    {
        if (!file_exists(PATH_HOME . "_config/config.json")) {
            $conf = file_get_contents(PATH_HOME . "_config/config.php");

            $config = [];
            foreach (explode("define('", $conf) as $i => $item) {
                if ($i > 0) {
                    $d = explode("'", $item);
                    $config[strtolower(trim($d[0]))] = $d[2];
                }
            }

            Config::writeFile("_config/.htaccess", "Deny from all");
            Config::createConfig($config);
        }
    }

    /**
     * Atualiza a Versão do site
     */
    private function updateVersionNumber()
    {
        $dados = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        $dados['version'] += 0.01;
        Config::createConfig($dados);

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/version.txt", "w+");
        fwrite($f, file_get_contents(PATH_HOME . "composer.lock"));
        fclose($f);
    }

    private function checkAdminExist()
    {
        $read = new Read();
        $read->exeRead(PRE . "usuarios");
        if (!$read->getResult())
            Entity::add("usuarios", ["nome" => "Admin", "setor" => "", "status" => 1, "password" => "mudar"]);
    }

    /**
     * @param array $custom
     */
    private function updateVersion(array $custom)
    {
        //cria/atualiza update log file
        Config::updateSite();

        if(empty($custom)) {
            $this->updateDependenciesEntity();
            $this->checkAdminExist();
            $this->updateAssets();
            $this->createMinifyAssetsLib();
            $this->createManifest();
            $this->updateServiceWorker();
            $this->overloadTplConfig();

        } elseif(is_array($custom)) {

            if(in_array("entity", $custom)) {
                $this->updateDependenciesEntity();
            }

            if(in_array("assets", $custom)) {
                $this->updateAssets();
                $this->createMinifyAssetsLib();
            }

            if(in_array("manifest", $custom)) {
                $this->createCoreImages();
                $this->createManifest();
                $this->updateServiceWorker();
            }
        }

        $this->result = true;
    }

    private function overloadTplConfig() {
        foreach (["analytics", "aside", "head", "header", "index", "loading"] as $item) {
            if(file_exists(PATH_HOME . "public/overload/config/tpl/{$item}.tpl")) {
                Helper::createFolderIfNoExist(PATH_HOME . VENDOR . "config/public/tpl/overloaded");
                copy(PATH_HOME . VENDOR . "config/public/tpl/{$item}.tpl", PATH_HOME . VENDOR . "config/public/tpl/overloaded/{$item}.tpl");
                copy(PATH_HOME . "public/overload/config/tpl/{$item}.tpl", PATH_HOME . VENDOR . "config/public/tpl/{$item}.tpl");
            }
        }
    }

    private function updateAssets()
    {
        //Remove only core Assets
        if (file_exists(PATH_HOME . "assetsPublic/core.min.js"))
            unlink(PATH_HOME . "assetsPublic/core.min.js");

        if (file_exists(PATH_HOME . "assetsPublic/core.min.css"))
            unlink(PATH_HOME . "assetsPublic/core.min.css");

        if (file_exists(PATH_HOME . "assetsPublic/fonts.min.css"))
            unlink(PATH_HOME . "assetsPublic/fonts.min.css");

        if (file_exists(PATH_HOME . "assetsPublic/appCore.min.js"))
            unlink(PATH_HOME . "assetsPublic/appCore.min.js");

        if (file_exists(PATH_HOME . "assetsPublic/tableCore.min.js"))
            unlink(PATH_HOME . "assetsPublic/tableCore.min.js");

        if (file_exists(PATH_HOME . "assetsPublic/tableCore.min.css"))
            unlink(PATH_HOME . "assetsPublic/tableCore.min.css");

        if (file_exists(PATH_HOME . "assetsPublic/view")) {
            foreach (Helper::listFolder(PATH_HOME . "assetsPublic/view") as $item)
                unlink(PATH_HOME . "assetsPublic/view/{$item}");
        }

        if (file_exists(PATH_HOME . "templates_c")) {
            foreach (Helper::listFolder(PATH_HOME . "templates_c") as $item)
                unlink(PATH_HOME . "templates_c/{$item}");
        }

        //gera core novamente
        $f = [];
        if (file_exists(PATH_HOME . "_config/param.json"))
            $f = json_decode(file_get_contents(PATH_HOME . "_config/param.json"), !0);

        $list = implode('/', array_unique(array_merge($f['js'], $f['css'])));
        $data = json_decode(file_get_contents(REPOSITORIO . "app/library/{$list}"), !0);
        if (!empty($data)) {
            $this->createCoreJs($f['js'], $data, 'core');
            $this->createCoreCss($f['css'], $data, 'core');
        }

        $this->createCoreFont($f['font'], $f['icon'], 'fonts');
        $this->createCoreImages();

        $m = new Minify\JS(PATH_HOME . VENDOR . "config/public/assets/jquery.min.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/hammer.min.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/moment.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/toast.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/mustache.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/idb.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/indexedDB.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/appCore.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/jquery-migrate.1.4.1.min.js");
        $m->minify(PATH_HOME . "assetsPublic/appCore.min.js");

        //table js & css
        if (!file_exists(PATH_HOME . "assetsPublic/tableCore.min.js")) {
            $minifier = new Minify\JS(file_get_contents(PATH_HOME . VENDOR . "table/public/assets/table.js"));
            $minifier->minify(PATH_HOME . "assetsPublic/tableCore.min.js");
        }

        $this->copyInstallTemplate();
        $this->copyCustomSystem();
    }

    /**
     * Copia os templates para o sistema em caso de atualizações
     */
    private function copyInstallTemplate()
    {
        Helper::createFolderIfNoExist(PATH_HOME . "public/dash/admin");
        Helper::createFolderIfNoExist(PATH_HOME . "public/overload");
        Config::writeFile("index.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/index.txt"));
        Config::writeFile("apiView.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiView.txt"));
        Config::writeFile("apiGet.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiGet.txt"));
        Config::writeFile("apiSet.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiSet.txt"));
        Config::writeFile("apiApi.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApi.txt"));
        Config::writeFile("apiApiPublic.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApiPublic.txt"));
        Config::writeFile("image-convert.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/image-convert.txt"));
        if(!file_exists(PATH_HOME . "public/dash/menu.json"))
            Config::writeFile("public/dash/menu.json", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/dash.txt"));
        if(!file_exists(PATH_HOME . "public/dash/admin/menu.json"))
            Config::writeFile("public/dash/admin/menu.json", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/dashAdmin.txt"));

        //CONSTANTES EM CONFIG
        $contantes = [];
        require_once PATH_HOME . VENDOR . "config/public/include/constantes.php";
        if(!empty($contantes) && is_array($contantes)) {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            foreach ($contantes as $contante => $value) {
                if (!isset($config[$contante]))
                    $config[$contante] = $value;
            }
            $config['dev'] = preg_match("/localhost\//i", $config['home']);
            $config['publico'] = $config['home'] . $config['vendor'] . $config['dominio'] . "/public/";
            Config::createConfig($config);
        }

        //CONSTANTES REMOVE
        $contantes = [];
        require_once PATH_HOME . VENDOR . "config/public/include/constantes.php";
        if(!empty($contantes) && is_array($contantes)) {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            foreach ($contantes as $contante => $value) {
                if (isset($config[$contante]))
                    unset($config[$contante]);
            }
            Config::createConfig($config);
        }
        unset($contantes);

        if(!file_exists(PATH_HOME . "public/assets/index.js"))
            Config::writeFile("public/assets/index.js", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/viewIndexJs.txt"));

        //Bloqueios por .htaccess
        Config::writeFile("_config/.htaccess", "Deny from all");
        Config::writeFile("entity/.htaccess", "Deny from all");
        Config::writeFile("public/react/.htaccess", "Deny from all");
        Config::writeFile("public/cron/.htaccess", "Deny from all");
        Config::writeFile("public/api/.htaccess", "Deny from all");
        Config::writeFile("vendor/.htaccess", $this->getAccessFile());

        if (!file_exists(PATH_HOME . "entity/general/general_info.json"))
            Config::writeFile("entity/general/general_info.json", "[]");
    }

    /**
     * Copia arquivos personalizados das libs para o sistema,
     * arquivos como tema, cabeçalho e outras personalizações
     */
    private function copyCustomSystem()
    {
        //Para cada biblioteca
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {

            // copia tema caso não exista no projeto mas exista nas libs
            if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . $lib . "/public/assets/theme.min.css"))
                copy(PATH_HOME . VENDOR . $lib . "/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

            $libNot = Config::getMenuNotAllow();

            //Remove index caso alguma biblioteca já possua
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view/index.php") && file_exists(PATH_HOME . "public/view/index.php")) {
                if (preg_match("/<h1>Parabéns, tudo funcionando de acordo!<\/h1>/i", file_get_contents(PATH_HOME . "public/view/index.php")) && (!isset($libNot) || !in_array($lib, $libNot))) {
                    unlink(PATH_HOME . "public/view/index.php");
                    unlink(PATH_HOME . "public/param/index.json");
                }
            }
        }
    }

    private function getAccessFile()
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
        </Files>';
    }

    /**
     * @param array $jsList
     * @param array $data
     * @param string $name
     */
    private function createCoreJs(array $jsList, array $data, string $name = "core")
    {
        if (!file_exists(PATH_HOME . "assetsPublic/{$name}.min.js")) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
            $minifier = new Minify\JS("");

            foreach ($data as $datum) {
                if (in_array($datum['nome'], $jsList)) {
                    foreach ($datum['arquivos'] as $file) {
                        if ($file['type'] === "text/javascript")
                            $minifier->add($file['content']);
                    }
                }
            }

            if(is_array($jsList) && !empty($jsList)) {
                foreach ($jsList as $i => $js) {
                    if(file_exists(PATH_HOME . "public/assets/{$js}.js"))
                        $minifier->add(PATH_HOME . "public/assets/{$js}.js");
                    elseif(file_exists(PATH_HOME . "public/assets/js/{$js}.js"))
                        $minifier->add(PATH_HOME . "public/assets/js/{$js}.js");
                }
            } elseif(is_string($jsList)) {
                if(file_exists(PATH_HOME . "public/assets/{$jsList}.js"))
                    $minifier->add(PATH_HOME . "public/assets/{$jsList}.js");
                elseif(file_exists(PATH_HOME . "public/assets/js/{$jsList}.js"))
                    $minifier->add(PATH_HOME . "public/assets/js/{$jsList}.js");
            }

            $minifier->minify(PATH_HOME . "assetsPublic/{$name}.min.js");
        }
    }

    /**
     * @param array $cssList
     * @param array $data
     * @param string $name
     */
    private function createCoreCss(array $cssList, array $data, string $name = "core")
    {
        if (!file_exists(PATH_HOME . "assetsPublic/{$name}.min.css")) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");

            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);

            $themeFile = file_get_contents(PATH_HOME . "public/assets/theme.min.css");
            $theme = explode("}", explode(".theme{", $themeFile)[1])[0];
            $themeColor = explode("}", explode(".theme-text-aux{", $themeFile)[1])[0];
            $theme = explode("!important", explode("background-color:", $theme)[1])[0];
            $themeColor = explode("!important", explode("color:", $themeColor)[1])[0];

            $minifier = new Minify\CSS("");
            $arrayReplace = ['{$home}' => HOME, '{$vendor}' => VENDOR, '{$version}' => $config['version'], '{$favicon}' => $config['favicon'], '{$logo}' => $config['logo'], '{$theme}' => $theme, '{$theme-aux}' => $themeColor, '{$publico}' => PUBLICO,
                '{{home}}' => HOME, '{{vendor}}' => VENDOR, '{{version}}' => $config['version'], '{{favicon}}' => $config['favicon'], '{{logo}}' => $config['logo'], '{{theme}}' => $theme, '{{theme-aux}}' => $themeColor, '{{publico}}' => PUBLICO];

            foreach ($cssList as $item) {
                $datum = array_values(array_filter(array_map(function ($d) use ($item) {
                    return $d['nome'] === $item ? $d : [];
                }, $data)));

                if (!empty($datum[0]) && !empty($datum[0]['arquivos'])) {
                    foreach ($datum[0]['arquivos'] as $file) {
                        if ($file['type'] === "text/css")
                            $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), $file['content']));
                    }
                }
            }

            //copia theme padrão para pasta do site
            if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . "config/public/assets/theme.min.css"))
                copy(PATH_HOME . VENDOR . "config/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

            $minifier->add(PATH_HOME . "public/assets/theme.min.css");

            if(is_array($cssList) && !empty($cssList)) {
                foreach ($cssList as $i => $css) {
                    if(file_exists(PATH_HOME . "public/assets/{$css}.css"))
                        $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), file_get_contents(PATH_HOME . "public/assets/{$css}.css")));
                    elseif(file_exists(PATH_HOME . "public/assets/css/{$css}.css"))
                        $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), file_get_contents(PATH_HOME . "public/assets/css/{$css}.css")));
                }
            } elseif(is_string($cssList)) {
                if(file_exists(PATH_HOME . "public/assets/{$cssList}.css"))
                    $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), file_get_contents(PATH_HOME . "public/assets/{$cssList}.css")));
                elseif(file_exists(PATH_HOME . "public/assets/css/{$cssList}.css"))
                    $minifier->add(str_replace(array_keys($arrayReplace), array_values($arrayReplace), file_get_contents(PATH_HOME . "public/assets/css/{$cssList}.css")));
            }

            $minifier->minify(PATH_HOME . "assetsPublic/{$name}.min.css");
        }
    }

    /**
     * @param $fontList
     * @param null $iconList
     * @param string $name
     */
    private function createCoreFont($fontList, $iconList = null, string $name = 'fonts')
    {
        if (!file_exists(PATH_HOME . "assetsPublic/{$name}.min.css")) {
            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic");
            $fonts = "";
            if ($fontList) {
                foreach ($fontList as $item)
                    $fonts .= $this->getFontIcon($item, "font");
            }
            if ($iconList) {
                foreach ($iconList as $item)
                    $fonts .= $this->getFontIcon($item, "icon");
            }

            $m = new Minify\CSS($fonts);
            $m->minify(PATH_HOME . "assetsPublic/{$name}.min.css");
        }
    }

    /**
     * Cria Imagens do sistema
     */
    private function createCoreImages()
    {
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/img");
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        copy(PATH_HOME . VENDOR . "config/public/assets/dino.png", PATH_HOME . "assetsPublic/img/dino.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/file.png", PATH_HOME . "assetsPublic/img/file.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/image-not-found.png", PATH_HOME . "assetsPublic/img/img.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/dino.webp", PATH_HOME . "assetsPublic/img/dino.webp");
        copy(PATH_HOME . VENDOR . "config/public/assets/file.webp", PATH_HOME . "assetsPublic/img/file.webp");
        copy(PATH_HOME . VENDOR . "config/public/assets/image-not-found.webp", PATH_HOME . "assetsPublic/img/img.webp");
        copy(PATH_HOME . VENDOR . "config/public/assets/loading.webp", PATH_HOME . "assetsPublic/img/loading.webp");
        copy(PATH_HOME . VENDOR . "config/public/assets/loading.gif", PATH_HOME . "assetsPublic/img/loading.gif");
        copy(PATH_HOME . VENDOR . "config/public/assets/file_type.svg", PATH_HOME . "assetsPublic/img/file_type.svg");

        if(file_exists(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/favicon.png")))
            copy(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/favicon.png"), PATH_HOME . "assetsPublic/img/favicon.png");

        if(!empty($config['logo']) && file_exists(PATH_HOME . $config['logo']))
            copy(PATH_HOME . $config['logo'], PATH_HOME . "assetsPublic/img/logo.png");
        elseif(file_exists(PATH_HOME . "assetsPublic/img/logo.png"))
            unlink(PATH_HOME . "assetsPublic/img/logo.png");
    }

    /**
     * Retorna lista com todos os JS e CSS que são usadas na aplicação que estão sendo servidas pela central
     * @param array $vendors
     * @return array
     */
    private function getAllAssetsFromRepositorio(array $vendors): array
    {
        $lista = [];
        foreach ($vendors as $lib) {
            $path = PATH_HOME . VENDOR . $lib . "/public/";
            if (file_exists($path . "view")) {
                //para cada view
                foreach (Helper::listFolder($path . "view") as $view) {
                    if (preg_match('/.php$/i', $view)) {
                        $nameView = str_replace('.php', '', $view);
                        if (file_exists($path . "param/{$nameView}.json")) {

                            $param = json_decode(file_get_contents($path . "param/{$nameView}.json"), true);
                            if (!empty($param['js'])) {
                                if (is_string($param['js']) && count(explode('.', $param['js'])) === 1 && !in_array($param['js'], $lista)) {
                                    $lista[] = $param['js'];
                                } elseif (is_array($param['js'])) {
                                    foreach ($param['js'] as $js) {
                                        if (count(explode('.', $js)) === 1 && !in_array($js, $lista))
                                            $lista[] = $js;
                                    }
                                }
                            }
                            if (!empty($param['css'])) {
                                if (is_string($param['css']) && count(explode('.', $param['css'])) === 1 && !in_array($param['css'], $lista)) {
                                    $lista[] = $param['css'];
                                } elseif (is_array($param['css'])) {
                                    foreach ($param['css'] as $css) {
                                        if (count(explode('.', $css)) === 1 && !in_array($css, $lista))
                                            $lista[] = $css;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $lista;
    }

    /**
     * @param array $vendors
     * Cria cache dos assets requisitados pelas views
     */
    private function createRepositorioCache(array $vendors)
    {
        $listaRequestScripts = implode('/', $this->getAllAssetsFromRepositorio($vendors));
        $data = json_decode(file_get_contents(REPOSITORIO . "app/library/{$listaRequestScripts}"), !0);

        if(!empty($data)) {
            foreach ($data as $datum) {
                foreach ($datum['arquivos'] as $file) {
                    if ($file['type'] === "text/javascript" && !empty($file['content'])) {

                        //remove old
                        if (file_exists(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js"))
                            unlink(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js");

                        //minifica novo
                        $minifier = new Minify\JS($file['content']);
                        $minifier->minify(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js");

                    } elseif ($file['type'] === "text/css" && !empty($file['content'])) {

                        //remove old
                        if (file_exists(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css"))
                            unlink(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css");

                        //minifica novo
                        $minifier = new Minify\CSS($file['content']);
                        $minifier->minify(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css");
                    }
                }
            }
        }
    }

    /**
     * @param string $url
     */
    private function downloadAssets(string $url)
    {
        if (preg_match('/^http/i', $url)) {
            $nameOnline = explode('.', pathinfo($url, PATHINFO_FILENAME))[0];
            $extOnline = pathinfo($url, PATHINFO_EXTENSION);

            if (!file_exists(PATH_HOME . "assetsPublic/cache/{$nameOnline}.min.{$extOnline}")) {

                //busca online
                if ($extOnline === "js")
                    $m = new Minify\JS(file_get_contents($url));
                else
                    $m = new Minify\CSS(file_get_contents($url));

                $m->minify(PATH_HOME . "assetsPublic/cache/{$nameOnline}.min.{$extOnline}");
            }
        } else {

            //busca online
            $data = json_decode(file_get_contents(REPOSITORIO . "app/library/{$url}"), !0);

            if(!empty($data)) {
                foreach ($data as $datum) {
                    foreach ($datum['arquivos'] as $file) {
                        if ($file['type'] === "text/javascript" && !empty($file['content'])) {

                            //remove old
                            if (file_exists(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js"))
                                unlink(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js");

                            //minifica novo
                            $minifier = new Minify\JS($file['content']);
                            $minifier->minify(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.js");

                        } elseif ($file['type'] === "text/css" && !empty($file['content'])) {

                            //remove old
                            if (file_exists(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css"))
                                unlink(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css");

                            //minifica novo
                            $minifier = new Minify\CSS($file['content']);
                            $minifier->minify(PATH_HOME . "assetsPublic/cache/{$datum['nome']}.min.css");
                        }
                    }
                }
            }
        }
    }

    /**
     * @param array $vendors
     */
    private function downloadAssetsCache(array $vendors)
    {
        foreach ($vendors as $lib) {
            $path = PATH_HOME . VENDOR . $lib . "/public/";
            if (file_exists($path . "view")) {
                foreach (Helper::listFolder($path . "view") as $view) {
                    if (preg_match('/.php$/i', $view)) {

                        //para cada view
                        $nameView = str_replace('.php', '', $view);
                        if (file_exists($path . "param/{$nameView}.json")) {
                            $param = json_decode(file_get_contents($path . "param/{$nameView}.json"), true);

                            if (!empty($param['js']) || !empty($param['css'])) {
                                $assets = array_unique((!empty($param['js']) ? (is_string($param['js']) ? [$param['js']] : $param['js']) : []));
                                $assetsCss = array_unique((!empty($param['css']) ? (is_string($param['css']) ? [$param['css']] : $param['css']) : []));

                                foreach ($assets as $asset) {
                                    if (is_string($asset))
                                        $this->downloadAssets($asset, 'js');
                                }
                                foreach ($assetsCss as $asset) {
                                    if (is_string($asset))
                                        $this->downloadAssets($asset, 'css');
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Minifica todos os assets das bibliotecas
     */
    private function createMinifyAssetsLib()
    {
        Helper::createFolderIfNoExist(PATH_HOME . 'assetsPublic/cache');
        Helper::createFolderIfNoExist(PATH_HOME . 'assetsPublic/view');

        //Remove todos os dados das pastas de assets
        foreach (Helper::listFolder(PATH_HOME . "assetsPublic/cache") as $cache) {
            if(!is_dir(PATH_HOME . "assetsPublic/cache/" . $cache))
                unlink(PATH_HOME . "assetsPublic/cache/" . $cache);
        }
        foreach (Helper::listFolder(PATH_HOME . "assetsPublic/view") as $cache) {
            if(!is_dir(PATH_HOME . "assetsPublic/view/" . $cache))
                unlink(PATH_HOME . "assetsPublic/view/" . $cache);
        }

        $vendors = Config::getViewPermissoes();
        $this->createRepositorioCache($vendors);
        $this->downloadAssetsCache($vendors);
    }

    private function generateInfo(array $metadados): array
    {
        $data = [
            "identifier" => 0, "title" => null, "link" => null, "status" => null, "date" => null, "datetime" => null, "valor" => null, "email" => null, "tel" => null, "cpf" => null, "cnpj" => null, "cep" => null, "time" => null, "week" => null, "month" => null, "year" => null,
            "required" => null, "unique" => null, "publisher" => null, "constant" => null, "extend" => null, "extend_mult" => null, "list" => null, "list_mult" => null, "selecao" => null, "selecao_mult" => null,
            "source" => [
                "image" => null,
                "audio" => null,
                "video" => null,
                "multimidia" => null,
                "compact" => null,
                "document" => null,
                "denveloper" => null,
                "arquivo" => null,
                "source" => null
            ]
        ];

        foreach ($metadados as $i => $dados) {
            if (in_array($dados['key'], ["unique", "extend", "extend_mult", "list", "list_mult", "selecao", "selecao_mult"]))
                $data[$dados['key']][] = $i;

            if (in_array($dados['format'], ["title", "link", "status", "date", "datetime", "valor", "email", "tel", "cpf", "cnpj", "cep", "time", "week", "month", "year"]))
                $data[$dados['format']] = $i;

            if ($dados['key'] === "publisher")
                $data["publisher"] = $i;

            if ($dados['key'] === "source" || $dados['key'] === "sources")
                $data['source'][$this->checkSource($dados['allow']['values'])][] = $i;

            if ($dados['default'] === false)
                $data['required'][] = $i;

            if (!$dados['update'])
                $data["constant"][] = $i;
        }

        return $data;
    }

    /**
     * Sincroniza entidades e banco
     */
    private function updateDependenciesEntity()
    {
        Helper::createFolderIfNoExist(PATH_HOME . "entity");
        Helper::createFolderIfNoExist(PATH_HOME . "entity/cache");
        Helper::createFolderIfNoExist(PATH_HOME . "entity/cache/info");

        //importa entidades ausentes para o sistema
        $sql = new SqlCommand();
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/cache")) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR . "{$lib}/public/entity/cache") as $file) {
                    if (!file_exists(PATH_HOME . "entity/cache/{$file}") && preg_match('/\w+\.json$/i', $file)) {
                        copy(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/{$file}", PATH_HOME . "entity/cache/{$file}");

                        /* INFO */
                        if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/info/{$file}")) {
                            if (file_exists(PATH_HOME . "entity/cache/info/{$file}"))
                                unlink(PATH_HOME . "entity/cache/info/{$file}");

                            copy(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/info/{$file}", PATH_HOME . "entity/cache/info/{$file}");

                        } elseif (!file_exists(PATH_HOME . "entity/cache/info/{$file}")) {
                            //cria info
                            $data = $this->generateInfo(\Entity\Metadados::getDicionario(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/{$file}"));
                            $fp = fopen(PATH_HOME . "entity/cache/info/" . $file, "w");
                            fwrite($fp, json_encode($data));
                            fclose($fp);
                        }

                        new EntityCreateEntityDatabase(str_replace('.json', '', $file));
                    } else {
                        $sql->exeCommand("SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'TheSchema' AND TABLE_NAME = '" . PRE . str_replace('.json', '', $file) . "'");
                        if(!$sql->getResult())
                            new EntityCreateEntityDatabase(str_replace('.json', '', $file));

                    }
                }
            }
        }
    }

    /**
     * Create Manifest
     */
    private function createManifest()
    {
        //Cria Tamanhos de Ícones
        $dados = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        $this->createFaviconSizes($dados);

        //Create Manifest
        $themeFile = file_get_contents(PATH_HOME . "public/assets/theme.min.css");
        $theme = explode("}", explode(".theme{", $themeFile)[1])[0];
        $themed = explode("}", explode(".theme-d1{", $themeFile)[1])[0];
        $themeBack = explode("!important", explode("background-color:", $theme)[1])[0];
        $themeBackd = explode("!important", explode("background-color:", $themed)[1])[0];
        $content = str_replace(['{$sitename}', '{$theme}', '{$themed}', '{$version}'], [$dados['sitename'], $themeBack, $themeBackd, $dados['version']], file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/manifest.txt"));

        $fp = fopen(PATH_HOME . "manifest.json", "w");
        fwrite($fp, $content);
        fclose($fp);
    }

    /**
     * @param array $dados
     */
    private function createFaviconSizes(array $dados)
    {
        Helper::createFolderIfNoExist(PATH_HOME . "uploads");
        Helper::createFolderIfNoExist(PATH_HOME . "uploads/site");

        $fav = \WideImage\WideImage::load(PATH_HOME . str_replace($dados['home'], '', $dados['favicon']));
        $fav->resize(512, 512, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-512.png");
        $fav->resize(256, 256, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-256.png");
        $fav->resize(192, 192, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-192.png");
        $fav->resize(152, 152, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-152.png");
        $fav->resize(144, 144, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-144.png");
        $fav->resize(128, 128, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-128.png");
        $fav->resize(96, 96, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-96.png");
        $fav->resize(48, 48, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-48.png");
    }

    private function updateServiceWorker()
    {
        //copia service worker
        $service = file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/service-worker.txt");
        $service = str_replace(["const VERSION = '';", "const HOME = '';", "const FAVICON = '';"], ["const VERSION = '" . (VERSION + 0.01) . "';", "const HOME = '" . HOME . "';", "const FAVICON = '" . FAVICON . "';"], $service);

        $f = fopen(PATH_HOME . "service-worker.js", "w+");
        fwrite($f, $service);
        fclose($f);
    }

    private function checkSource($valores)
    {
        $type = [];
        $data = [
            "image" => ["png", "jpg", "jpeg", "gif", "bmp", "tif", "tiff", "psd", "svg"],
            "video" => ["mp4", "avi", "mkv", "mpeg", "flv", "wmv", "mov", "rmvb", "vob", "3gp", "mpg"],
            "audio" => ["mp3", "aac", "ogg", "wma", "mid", "alac", "flac", "wav", "pcm", "aiff", "ac3"],
            "document" => ["txt", "doc", "docx", "dot", "dotx", "dotm", "ppt", "pptx", "pps", "potm", "potx", "pdf", "xls", "xlsx", "xltx", "rtf"],
            "compact" => ["rar", "zip", "tar", "7z"],
            "denveloper" => ["html", "css", "scss", "js", "tpl", "json", "xml", "md", "sql", "dll"]
        ];

        foreach ($data as $tipo => $dados) {
            if (count(array_intersect($dados, $valores)) > 0)
                $type[] = $tipo;
        }

        if (count($type) > 1) {
            if (count(array_intersect(["document", "compact", "denveloper"], $type)) === 0 && count(array_intersect(["image", "video", "audio"], $type)) > 1)
                return "multimidia";
            else if (count(array_intersect(["document", "compact", "denveloper"], $type)) > 1 && count(array_intersect(["image", "video", "audio"], $type)) === 0)
                return "arquivo";
            else
                return "source";
        } else {
            return $type[0];
        }
    }

    /**
     * @param string $item
     * @param string $tipo
     * @return string
     */
    private function getFontIcon(string $item, string $tipo): string
    {
        $data = "";
        try {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
            $urlOnline = $tipo === "font" ? "https://fonts.googleapis.com/css?family=" . ucfirst($item) . ":100,300,400,700" : "https://fonts.googleapis.com/icon?family=" . ucfirst($item) . "+Icons";
            $data = @file_get_contents($urlOnline);
            foreach (explode('url(', $data) as $i => $u) {
                if ($i > 0) {
                    $url = explode(')', $u)[0];
                    $urlData = @file_get_contents($url);
                    if (!file_exists(PATH_HOME . "assetsPublic/fonts/" . pathinfo($url, PATHINFO_BASENAME))) {
                        if ($urlData) {
                            Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/fonts");
                            $f = fopen(PATH_HOME . "assetsPublic/fonts/" . pathinfo($url, PATHINFO_BASENAME), "w+");
                            fwrite($f, $urlData);
                            fclose($f);
                            $data = str_replace($url, HOME . "assetsPublic/fonts/" . pathinfo($url, PATHINFO_BASENAME) . "?v=" . $config['version'], $data);
                        } else {
                            $before = "@font-face" . explode("@font-face", $u[$i - 1])[1] . "url(";
                            $after = explode("}", $u)[0];
                            $data = str_replace($before . $after, "", $data);
                        }
                    } else {
                        $data = str_replace($url, HOME . "assetsPublic/fonts/" . pathinfo($url, PATHINFO_BASENAME) . "?v=" . $config['version'], $data);
                    }
                }
            }
        } catch (Exception $e) {
        }

        return $data;
    }
}