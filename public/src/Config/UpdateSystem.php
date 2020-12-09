<?php

namespace Config;

use Conn\Read;
use Conn\SqlCommand;
use Entity\Entity;
use Helpers\Helper;
use Tholu\Packer\Packer;

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

            $this->updateVersion($custom);
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
        } else {

            $theme = "#2196f3";
            $themeColor = "#ffffff";

            if (file_exists(PATH_HOME . "public/assets/theme.min.css")) {
                $f = file_get_contents(PATH_HOME . "public/assets/theme.min.css");
                if (preg_match('/\.theme\{/i', $f)) {
                    $theme = explode(".theme{", $f)[1];
                    $themeb = explode("!important", explode("background-color:", $theme)[1])[0];
                    $themec = explode("!important", explode("color:", $theme)[1])[0];
                    if (!empty($themeb))
                        $theme = trim($themeb);

                    if (!empty($themec))
                        $themeColor = trim($themec);

                } else if (preg_match('/\.theme \{/i', $f)) {
                    $theme = explode(".theme {", $f)[1];
                    $themeb = explode("!important", explode("background-color:", $theme)[1])[0];
                    $themec = explode("!important", explode("color:", $theme)[1])[0];

                    if (!empty($themeb))
                        $theme = trim($themeb);

                    if (!empty($themec))
                        $themeColor = trim($themec);
                }
            }
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            $config['theme'] = $theme;
            $config['themetext'] = $themeColor;
            Config::createConfig($config);
        }
    }

    /**
     * Atualiza a Versão do site
     * @return mixed
     */
    private function updateVersionNumber()
    {
        $dados = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        $dados['version'] = number_format($dados['version'] + 0.01, 2);
        Config::createConfig($dados);
        return $dados;
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
        /**
         * Check if all default folders exists
         */
        $this->checkDirBase();

        $dados = $this->updateVersionNumber();
        //cria/atualiza update log file
        Config::updateSite();
        Config::createLibsDirectory();

        if (empty($custom)) {
            $this->updateDependenciesEntity();
            $this->checkAdminExist();
            $this->updateConfigFolder();
            $this->updateAssets($dados);
            $this->createCoreCssApp();
            $this->createMinifyAssetsLib();
            $this->createManifest($dados);
            $this->updateServiceWorker($dados);
            $this->deleteInstall();
            $this->tempUpdates();

        } elseif (is_array($custom)) {

            if (in_array("entity", $custom)) {
                $this->updateDependenciesEntity();
            }

            if (in_array("assets", $custom)) {
                $this->updateAssets($dados);
                $this->createMinifyAssetsLib();
            }

            if(in_array("theme", $custom)) {
                $this->updateAssets($dados);
                $this->createCoreCssApp();
                $this->createManifest($dados);

            } elseif (in_array("manifest", $custom)) {
                $this->createCoreCssApp();
                $this->createManifest($dados);
                $this->updateServiceWorker($dados);
            }
        }

        $this->createCachedDB();

        $this->result = true;
    }

    private function createCachedDB()
    {
        $sql = new SqlCommand();

        /**
         * Para cada entidade no sistema, cria o cache
         */
        foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
            if(pathinfo($entity, PATHINFO_EXTENSION) === "json") {
                $entity = str_replace(".json", "", $entity);

                /**
                 * Delete cached database
                 * Create cached database if not exist
                 */
                $sql->exeCommand(
                    "DROP TABLE IF EXISTS " . PRE . "wcache_" . $entity . ";"
                    . "CREATE TABLE IF NOT EXISTS `" . PRE . "wcache_" . $entity . "` (`id` INT(11) NOT NULL, `system_id` INT(11) DEFAULT NULL, `data` longtext DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8;"
                    . "ALTER TABLE `" . PRE . "wcache_" . $entity . "` ADD PRIMARY KEY (`id`), MODIFY `id` int(11) NOT NULL AUTO_INCREMENT");
            }
        }
    }

    private function deleteInstall()
    {
        unlink(PATH_HOME . VENDOR . "config/public/startup.php");
        Helper::recurseDelete(PATH_HOME . VENDOR . "config/public/include");
    }

    /**
     * Atualizações temporárias
     */
    private function tempUpdates()
    {
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);

        if(!isset($config['server']))
            $config['server'] = $config['home'];

        if(!isset($config['serverproduction']))
            $config['serverproduction'] = $config['home'];

        Config::createConfig($config);
    }

    /**
     * Atualiza arquivos na pasta _config
     */
    private function updateConfigFolder()
    {
        //Para cada biblioteca
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . "/{$lib}/public/_config")) {
                $base = PATH_HOME . VENDOR . "/{$lib}/public/_config/";

                if (file_exists($base . "permissoes.json") && !file_exists(PATH_HOME . "_config/permissoes.json"))
                    copy($base . "permissoes.json", PATH_HOME . "_config/permissoes.json");

                if (file_exists($base . "general_info.json"))
                    copy($base . "general_info.json", PATH_HOME . "entity/general/general_info.json");

                if (file_exists(PATH_HOME . VENDOR . "/{$lib}/public/assets/theme.min.css"))
                    copy(PATH_HOME . VENDOR . "/{$lib}/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

                if (file_exists($base . "config.json")) {
                    $configUp = json_decode(file_get_contents($base . "config.json"), !0);
                    $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);

                    if (!empty($configUp['cepaberto']) && empty($config['cepaberto']))
                        $config['cepaberto'] = $configUp['cepaberto'];

                    if (!empty($configUp['geocode']) && empty($config['geocode']))
                        $config['geocode'] = $configUp['geocode'];

                    if (!empty($configUp['push_public_key']) && empty($config['push_public_key']) && !empty($configUp['push_private_key']) && empty($config['push_private_key'])) {
                        $config['push_public_key'] = $configUp['push_public_key'];
                        $config['push_private_key'] = $configUp['push_private_key'];
                    }

                    if (!empty($configUp['emailkey']) && empty($config['emailkey']) && !empty($configUp['email']) && empty($config['email'])) {
                        $config['emailkey'] = $configUp['emailkey'];
                        $config['email'] = $configUp['email'];
                    }

                    Config::createConfig($config);
                }

                break;
            }
        }
    }

    /**
     * @param array $dados
     */
    private function updateAssets(array $dados)
    {

        /**
         * Delete all caches
         */
        Helper::recurseDelete(PATH_HOME . "assetsPublic");
        Helper::recurseDelete(PATH_HOME . "templates_c");

        Config::createDir("assetsPublic");
        Config::createDir("assetsPublic/img");
        Config::createDir("assetsPublic/img/splashscreens");
        Config::createDir("assetsPublic/language");
        Config::createDir("assetsPublic/fonts");

        /**
         * copy default theme from Config to the project folder if not exist
         */
        if (!file_exists(PATH_HOME . "public/assets/theme.min.css") && file_exists(PATH_HOME . VENDOR . "config/public/assets/theme.min.css"))
            copy(PATH_HOME . VENDOR . "config/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");

        /**
         * Create fonts and images default system to cache
         */
        $this->createCoreFont(["roboto"], ["https://fonts.googleapis.com/icon?family=Material+Icons"], 'fonts');
        $this->createCoreImages($dados);

        /**
         * AppCore JS Generator
         */
        if(DEV) {
            $m = file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/jquery.min.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/touch.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/toast.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/mustache.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/idb.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/indexedDB.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/appCore.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/ajax.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/jquery-migrate.1.4.1.min.js");

            /**
             * Adiciona todos os js dentro da pasta assets/appCore
             */
            foreach (Config::getRoutesFilesTo("assets/appCore", "js") as $jsCore)
                $m .= ";" . file_get_contents($jsCore);

            foreach (Config::getRoutesFilesTo("assets/appCore", "json") as $jsCore) {
                $file = json_decode(file_get_contents($jsCore), !0);
                if (!empty($file['js'])) {
                    if (is_array($file['js'])) {
                        foreach ($file['js'] as $js)
                            $m .= ";" . Config::getScriptContent($js);
                    } elseif (is_string($file['js'])) {
                        $m .= ";" . Config::getScriptContent($file['js']);
                    }
                }
            }

            $f = fopen(PATH_HOME . "assetsPublic/appCore.min.js", "w+");
            fwrite($f, $m);
            fclose($f);

            /**
             * AppCore Form JS Generator
             */
            $m = file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/draggable.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/mask.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/formValidate.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/form.js");

            $f = fopen(PATH_HOME . VENDOR . "config/public/assets/coreForm.js", "w+");
            fwrite($f, $m);
            fclose($f);

            /**
             * AppCore Report JS Generator
             */
            $m = file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/apexcharts.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/grafico.js");

            $f = fopen(PATH_HOME . VENDOR . "config/public/assets/coreReport.js", "w+");
            fwrite($f, $m);
            fclose($f);

            /**
             * AppCore Grid JS Generator
             */
            $m = file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/table.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/grid.js");
            $m .= ";" . file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/pagination.js");

            $f = fopen(PATH_HOME . VENDOR . "config/public/assets/coreGrid.js", "w");
            fwrite($f, trim(preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/', '', $m)));
            fclose($f);

        } else {
            $m = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/jquery.min.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/touch.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/toast.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/mustache.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/idb.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/indexedDB.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/appCore.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/ajax.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/jquery-migrate.1.4.1.min.js"));

            /**
             * Adiciona todos os js dentro da pasta assets/appCore
             */
            foreach (Config::getRoutesFilesTo("assets/appCore", "js") as $jsCore)
                $m->add(";" . file_get_contents($jsCore));

            foreach (Config::getRoutesFilesTo("assets/appCore", "json") as $jsCore) {
                $file = json_decode(file_get_contents($jsCore), !0);
                if (!empty($file['js'])) {
                    if (is_array($file['js'])) {
                        foreach ($file['js'] as $js)
                            $m->add(";" . Config::getScriptContent($js));
                    } elseif (is_string($file['js'])) {
                        $m->add(";" . Config::getScriptContent($file['js']));
                    }
                }
            }

            $m->minify(PATH_HOME . "assetsPublic/appCore.min.js");

            /**
             * AppCore Form JS Generator
             */
            $m = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/draggable.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/mask.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/formValidate.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/form.js"));
            $m->minify(PATH_HOME . VENDOR . "config/public/assets/coreForm.js");

            /**
             * AppCore Report JS Generator
             */
            $m = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/apexcharts.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/grafico.js"));
            $m->minify(PATH_HOME . VENDOR . "config/public/assets/coreReport.js");

            /**
             * AppCore Grid JS Generator
             */
            $m = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/table.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/grid.js"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/pagination.js"));
            $f = fopen(PATH_HOME . VENDOR . "config/public/assets/coreGrid.js", "w");
            fwrite($f, trim(preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/', '', $m->minify())));
            fclose($f);
        }

        /**
         * Rewrite default files that route the requests (index, get, set, serviceworker ...)
         */
        $this->copyInstallTemplate();
    }

    private function createCoreCssApp()
    {
        /**
         * AppCore CSS Generator
         */
        if(DEV) {
            $m = file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/normalize.css");
            $m .= file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/toast.css");
            $m .= file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/app.css");
            $m .= file_get_contents(PATH_HOME . "public/assets/theme.min.css");

            /**
             * Adiciona todos os css dentro da pasta assets/appCore
             */
            foreach (Config::getRoutesFilesTo("assets/appCore", "css") as $jsCore)
                $m .= file_get_contents($jsCore);

            foreach (Config::getRoutesFilesTo("assets/appCore", "json") as $jsCore) {
                $file = json_decode(file_get_contents($jsCore), !0);
                if (!empty($file['css'])) {
                    if (is_array($file['css'])) {
                        foreach ($file['css'] as $css)
                            $m .= Config::getCssContent($css);
                    } elseif (is_string($file['css'])) {
                        $m .= Config::getCssContent($file['css']);
                    }
                }
            }

            $f = fopen(PATH_HOME . "assetsPublic/appCore.min.css", "w+");
            fwrite($f, $m);
            fclose($f);

        } else {
            $m = new \MatthiasMullie\Minify\CSS(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/normalize.css"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/toast.css"));
            $m->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/libs/app.css"));
            $m->add(file_get_contents(PATH_HOME . "public/assets/theme.min.css"));

            /**
             * Adiciona todos os css dentro da pasta assets/appCore
             */
            foreach (Config::getRoutesFilesTo("assets/appCore", "css") as $jsCore)
                $m->add(file_get_contents($jsCore));

            foreach (Config::getRoutesFilesTo("assets/appCore", "json") as $jsCore) {
                $file = json_decode(file_get_contents($jsCore), !0);
                if (!empty($file['css'])) {
                    if (is_array($file['css'])) {
                        foreach ($file['css'] as $css)
                            $m->add(Config::getCssContent($css));
                    } elseif (is_string($file['css'])) {
                        $m->add(Config::getCssContent($file['css']));
                    }
                }
            }

            $m->minify(PATH_HOME . "assetsPublic/appCore.min.css");
        }
    }

    /**
     * Verifica se os diretórios padrões existem
     */
    private function checkDirBase()
    {
        Config::createDir("entity");
        Config::createDir("entity/general");
        Config::createDir("entity/cache");
        Config::createDir("entity/cache/info");
        Config::createDir("uploads");
        Config::createDir("uploads/site");
        Config::createDir("_config");
        Config::createDir("_cdn");
        Config::createDir("_cdn/vendor");
        Config::createDir("_cdn/userActivity");
        Config::createDir("_cdn/userSSE");
        Config::createDir("public");
        Config::createDir("public/_config");
        Config::createDir("public/view");
        Config::createDir("public/post");
        Config::createDir("public/get");
        Config::createDir("public/sse");
        Config::createDir("public/api");
        Config::createDir("public/overload");
        Config::createDir("public/react");
        Config::createDir("public/assets");
        Config::createDir("public/assets/core");
        Config::createDir("public/menu");
        Config::createDir("public/menu/admin");
        Config::createDir("public/menu/0");
        Config::createDir("public/tpl");
        Config::createDir("public/cron");
        Config::createDir("public/entity");
        Config::createDir("public/entity/cache");
        Config::createDir("public/entity/cache/info");
        Config::createDir("assetsPublic");
        Config::createDir("assetsPublic/img");
        Config::createDir("assetsPublic/img/splashscreens");
        Config::createDir("assetsPublic/language");
        Config::createDir("assetsPublic/fonts");
    }

    /**
     * Copia os templates para o sistema em caso de atualizações
     */
    private function copyInstallTemplate()
    {
        Config::writeFile("index.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/index.php"));
        Config::writeFile("apiView.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiView.php"));
        Config::writeFile("apiGet.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiGet.php"));
        Config::writeFile("apiPost.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiPost.php"));
        Config::writeFile("apiApi.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApi.php"));
        Config::writeFile("apiApiPublic.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApiPublic.php"));

        if (!file_exists(PATH_HOME . "assetsPublic/language/pt-br.json"))
            Config::writeFile("assetsPublic/language/pt-br.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/pt-br.json"));

        if (!file_exists(PATH_HOME . "assetsPublic/language/en.json"))
            Config::writeFile("assetsPublic/language/en.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/en.json"));

        if (!file_exists(PATH_HOME . "assetsPublic/language/es.json"))
            Config::writeFile("assetsPublic/language/es.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/es.json"));

        //CONSTANTES EM CONFIG
        $contantes = [];
        require_once PATH_HOME . VENDOR . "config/public/include/constantes.php";
        if (!empty($contantes) && is_array($contantes)) {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            foreach ($contantes as $contante => $value) {
                if (!isset($config[$contante]))
                    $config[$contante] = $value;
            }
            $config['dev'] = (defined('DEV') ? DEV : preg_match("/localhost\//i", $config['home']));
            Config::createConfig($config);
        }

        //CONSTANTES REMOVE
        $contantes = [];
        require_once PATH_HOME . VENDOR . "config/public/include/constantes.php";
        if (!empty($contantes) && is_array($contantes)) {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            foreach ($contantes as $contante => $value) {
                if (isset($config[$contante]))
                    unset($config[$contante]);
            }
            Config::createConfig($config);
        }
        unset($contantes);

        //Bloqueios por .htaccess
        Config::writeFile("_config/.htaccess", "Deny from all");
        Config::writeFile("assetsPublic/.htaccess", "Options -Indexes");
        Config::writeFile("entity/.htaccess", "Deny from all");
        Config::writeFile("public/.htaccess", Config::getHtaccessAssetsRule());
        Config::writeFile("templates_c/.htaccess", Config::getHtaccessAssetsRule());
        Config::writeFile("vendor/.htaccess", "Deny from all");

        if (!file_exists(PATH_HOME . "entity/general/general_info.json"))
            Config::writeFile("entity/general/general_info.json", "[]");
    }

    /**
     * @param $fontList
     * @param null $iconList
     * @param string $name
     */
    private function createCoreFont($fontList, $iconList = null, string $name = 'fonts')
    {
        if (!file_exists(PATH_HOME . "assetsPublic/{$name}.min.css")) {
            $fonts = "";
            if ($fontList) {
                foreach ($fontList as $item)
                    $fonts .= $this->getFontIcon($item, "font");
            }
            if ($iconList) {
                foreach ($iconList as $item)
                    $fonts .= $this->getFontIcon($item, "icon");
            }

            $f = fopen(PATH_HOME . "assetsPublic/{$name}.min.css", "w");
            fwrite($f, $fonts);
            fclose($f);
        }
    }

    /**
     * Cria Imagens do sistema
     * @param array $dados
     */
    private function createCoreImages(array $config)
    {
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/dino.png", PATH_HOME . "assetsPublic/img/dino.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/file.png", PATH_HOME . "assetsPublic/img/file.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/image-not-found.png", PATH_HOME . "assetsPublic/img/img.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/loading.gif", PATH_HOME . "assetsPublic/img/loading.gif");
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/loading.png", PATH_HOME . "assetsPublic/img/loading.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/libs-img/nonetwork.svg", PATH_HOME . "assetsPublic/img/nonetwork.svg");

        if (file_exists(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/libs-img/favicon.png")))
            copy(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/libs-img/favicon.png"), PATH_HOME . "assetsPublic/img/favicon.png");

        if (!empty($config['logo']) && file_exists(PATH_HOME . $config['logo']))
            copy(PATH_HOME . $config['logo'], PATH_HOME . "assetsPublic/img/logo." . pathinfo($config['logo'], PATHINFO_EXTENSION));
    }

    /**
     * Minifica todos os assets das bibliotecas
     */
    private function createMinifyAssetsLib()
    {
        //Remove todos os dados das pastas de assets
        if (file_exists(PATH_HOME . "assetsPublic/view"))
            Helper::recurseDelete(PATH_HOME . "assetsPublic/view");
    }

    /**
     * Sincroniza entidades e banco
     */
    private function updateDependenciesEntity()
    {
        /**
         * Move entitys from entity to the project public folder
         */
        if(defined('DEV') && DEV) {
            foreach (Helper::listFolder(PATH_HOME . "entity/cache") as $entity) {
                if (preg_match('/\.json$/i', $entity)) {

                    //Para cada Entidade
                    $isMyEntity = true;
                    foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
                        if ($isMyEntity && file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/cache/{$entity}"))
                            $isMyEntity = false;
                    }

                    /**
                     * If the entity has created on this maestru project,
                     * so add it
                     */
                    if ($isMyEntity) {
                        copy(PATH_HOME . "entity/cache/{$entity}", PATH_HOME . "public/entity/cache/{$entity}");
                        copy(PATH_HOME . "entity/cache/info/{$entity}", PATH_HOME . "public/entity/cache/info/{$entity}");
                    }
                }
            }

            if (file_exists(PATH_HOME . "_config/config.json")) {
                $conf = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);

                foreach (\Config\Config::getRoutesFilesTo("integracoes", "json") as $file => $dir) {
                    $integ = json_decode(file_get_contents($dir), !0);
                    if (!empty($integ['constantes'])) {
                        foreach ($integ['constantes'] as $constante) {
                            if (is_string($constante['column']) && !empty($constante['column']) && isset($conf[$constante['column']]))
                                unset($conf[$constante['column']]);
                        }
                    }
                }
                $f = fopen(PATH_HOME . "public/_config/config.json", "w+");
                fwrite($f, json_encode($conf));
                fclose($f);
            }

            if (file_exists(PATH_HOME . "_config/permissoes.json"))
                copy(PATH_HOME . "_config/permissoes.json", PATH_HOME . "public/_config/permissoes.json");

            if (!empty(FAVICON) && file_exists(PATH_HOME . FAVICON))
                copy(PATH_HOME . FAVICON, PATH_HOME . "public/_config/favicon." . pathinfo(FAVICON, PATHINFO_EXTENSION));

            if (!empty(LOGO) && file_exists(PATH_HOME . LOGO))
                copy(PATH_HOME . LOGO, PATH_HOME . "public/_config/logo." . pathinfo(LOGO, PATHINFO_EXTENSION));

            if (file_exists(PATH_HOME . "entity/general/general_info.json"))
                copy(PATH_HOME . "entity/general/general_info.json", PATH_HOME . "public/_config/general_info.json");
        } else {
            if (file_exists(PATH_HOME . "public/_config/permissoes.json"))
                copy(PATH_HOME . "public/_config/permissoes.json", PATH_HOME . "_config/permissoes.json");
        }

        /**
         * Get list of entity
         */
        $listaEntity = [];
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . "{$lib}/public/entity/cache")) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR . "{$lib}/public/entity/cache") as $file) {
                    if (preg_match('/\w+\.json$/i', $file))
                        $listaEntity[$file] = PATH_HOME . VENDOR . "{$lib}/public/entity/cache/{$file}";
                }
            }
        }

        /**
         * Get list of entity on public
         */
        if ((!defined('DEV') || !DEV) && file_exists(PATH_HOME . "public/entity/cache")) {
            foreach (Helper::listFolder(PATH_HOME . "public/entity/cache") as $file) {
                if (preg_match('/\w+\.json$/i', $file))
                    $listaEntity[$file] = PATH_HOME . "public/entity/cache/{$file}";
            }
        }

        /**
         * Import/Update all
         */
        foreach ($listaEntity as $file => $dir) {
            $entity = str_replace(".json", "", $file);
            $infoDir = str_replace("entity/cache/", "entity/cache/info/", $dir);
            $metadados = json_decode(file_get_contents($dir), !0);
            $info = file_exists($infoDir) ? json_decode(file_get_contents($infoDir), !0) : (file_exists(PATH_HOME . "entity/cache/info/{$file}") ? json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$file}"), !0) : []);
            $isNew = file_exists(PATH_HOME . "entity/cache/{file}");

            new \EntityUi\SaveEntity($entity, $info['system'] ?? "", $info['icon'] ?? "", (!empty($info['user']) && is_numeric($info['user']) ? $info['user'] : 0), (!empty($info['autor']) && is_numeric($info['autor']) ? (int) $info['autor'] : null), $metadados, $info['identifier'] ?? 100);

            /**
             * Se for uma nova entidade, dê permissão de menu ao ADM
             */
            if($isNew) {
                $p = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), !0);
                $p['admin'][$entity]['menu'] = "true";
                Config::writeFile(PATH_HOME . "_config/permissoes.json", json_encode($p));
            }
        }
    }

    /**
     * Create Manifest
     * @param array $dados
     */
    private function createManifest(array $dados)
    {
        //Cria Tamanhos de Ícones
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
        /**
         * Icones
         */
        try {
            $favicon = PATH_HOME . str_replace($dados['home'], '', $dados['favicon']);
            $fav = \WideImage\WideImage::load($favicon);
            $fav->resize(256, 256, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-256.png");
            $fav->resize(192, 192, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-192.png");
            $fav->resize(144, 144, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-144.png");
            $fav->resize(96, 96, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-96.png");
            $fav->resize(72, 72, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-72.png");
            $fav->resize(48, 48, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-48.png");
        } catch (\Exception $e) {

        }
    }

    /**
     * @param array $dados
     */
    private function updateServiceWorker(array $dados)
    {
        //copia service worker
        $service = file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/service-worker.js");
        $service = str_replace(["var VERSION = '';", "const HOME = '';"], ["var VERSION = '" . number_format($dados['version'], 2) . "';", "const HOME = '" . HOME . "';"], $service);

        $f = fopen(PATH_HOME . "service-worker.js", "w");
        fwrite($f, $service);
        fclose($f);

        //copia firebase-messaging
        if(defined("PUSH_PUBLIC_KEY") && !empty(PUSH_PUBLIC_KEY) && defined("FIREBASECONFIG") && !empty(FIREBASECONFIG)) {
            $service = file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/firebase-messaging-sw.js");
            $service = str_replace(["var VERSION = '';", "const HOME = '';", "const PUSH_PUBLIC_KEY = '';"], ["var VERSION = '" . number_format($dados['version'], 2) . "'; \n" . FIREBASECONFIG . "\n", "const HOME = '" . HOME . "';", "const PUSH_PUBLIC_KEY = '" . PUSH_PUBLIC_KEY . "';"], $service);

            $f = fopen(PATH_HOME . "firebase-messaging-sw.js", "w");
            fwrite($f, $service);
            fclose($f);
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
            $urlOnline = $tipo === "font" ? "https://fonts.googleapis.com/css?family=" . ucfirst($item) . ":100,300,400,700" : $item;
            $data = @file_get_contents($urlOnline);
            foreach (explode('url(', $data) as $i => $u) {
                if ($i > 0) {
                    $url = explode(')', $u)[0];
                    $urlData = @file_get_contents($url);
                    if (!file_exists(PATH_HOME . "assetsPublic/fonts/" . explode("?", pathinfo($url, PATHINFO_BASENAME))[0])) {
                        if ($urlData) {
                            $f = fopen(PATH_HOME . "assetsPublic/fonts/" . explode("?", pathinfo($url, PATHINFO_BASENAME))[0], "w+");
                            fwrite($f, $urlData);
                            fclose($f);
                            $data = str_replace($url, "fonts/" . pathinfo($url, PATHINFO_BASENAME) . "?v=" . $config['version'], $data);
                        } else {
                            $before = "@font-face" . explode("@font-face", $u[$i - 1])[1] . "url(";
                            $after = explode("}", $u)[0];
                            $data = str_replace($before . $after, "", $data);
                        }
                    } else {
                        $data = str_replace($url, "fonts/" . pathinfo($url, PATHINFO_BASENAME) . "?v=" . $config['version'], $data);
                    }
                }
            }
        } catch (Exception $e) {
        }

        return $data;
    }
}