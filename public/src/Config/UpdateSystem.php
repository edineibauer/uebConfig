<?php

namespace Config;

use EntityUi\EntityCreateEntityDatabase;
use Helpers\Helper;
use Conn\Read;
use Conn\SqlCommand;
use Entity\Entity;
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

                $this->updateVersion($custom);

            } elseif (file_exists(PATH_HOME . "_config/updates/version.txt")) {
                $keyVersion = file_get_contents(PATH_HOME . "composer.lock");
                $old = file_get_contents(PATH_HOME . "_config/updates/version.txt");
                if (!empty($custom) || $old !== $keyVersion) {
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
     * @return mixed
     */
    private function updateVersionNumber()
    {
        $dados = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), true);
        $dados['version'] = number_format($dados['version'] + 0.01, 2);
        Config::createConfig($dados);

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/version.txt", "w+");
        fwrite($f, file_get_contents(PATH_HOME . "composer.lock"));
        fclose($f);

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
        $dados = $this->updateVersionNumber();
        //cria/atualiza update log file
        Config::updateSite();
        Config::createLibsDirectory();

        if(empty($custom)) {
            $this->updateDependenciesEntity();
            $this->checkAdminExist();
            $this->updateConfigFolder();
            $this->updateAssets($dados);
            $this->createMinifyAssetsLib();
            $this->createManifest($dados);
            $this->updateServiceWorker($dados);

        } elseif(is_array($custom)) {

            if(in_array("entity", $custom)) {
                $this->updateDependenciesEntity();
            }

            if(in_array("assets", $custom)) {
                $this->updateAssets($dados);
                $this->createMinifyAssetsLib();
            }

            if(in_array("manifest", $custom)) {
                $this->createCoreImages($dados);
                $this->createManifest($dados);
                $this->updateServiceWorker($dados);
            }
        }

        $this->result = true;
    }

    /**
     * Atualiza arquivos na pasta _config
     */
    private function updateConfigFolder()
    {
        //Para cada biblioteca
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if(file_exists(PATH_HOME . VENDOR . "/{$lib}/public/_config")) {
                $base = PATH_HOME . VENDOR . "/{$lib}/public/_config/";

                if(file_exists($base . "param.json"))
                    copy($base . "param.json", PATH_HOME . "_config/param.json");

                if(file_exists($base . "permissoes.json"))
                    copy($base . "permissoes.json", PATH_HOME . "_config/permissoes.json");

                if(file_exists($base . "general_info.json"))
                    copy($base . "general_info.json", PATH_HOME . "entity/general/general_info.json");

                if(file_exists(PATH_HOME . VENDOR . "/{$lib}/public/assets/theme.min.css"))
                    copy(PATH_HOME . VENDOR . "/{$lib}/public/assets/theme.min.css", PATH_HOME . "public/assets/theme.min.css");
                
                if(file_exists($base . "config.json")) {
                    $configUp = json_decode(file_get_contents($base . "config.json"), !0);
                    $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);

                    if(!empty($configUp['cepaberto']) && empty($config['cepaberto']))
                        $config['cepaberto'] = $configUp['cepaberto'];

                    if(!empty($configUp['geocode']) && empty($config['geocode']))
                        $config['geocode'] = $configUp['geocode'];

                    if(!empty($configUp['push_public_key']) && empty($config['push_public_key']) && !empty($configUp['push_private_key']) && empty($config['push_private_key'])) {
                        $config['push_public_key'] = $configUp['push_public_key'];
                        $config['push_private_key'] = $configUp['push_private_key'];
                    }

                    if(!empty($configUp['emailkey']) && empty($config['emailkey']) && !empty($configUp['email']) && empty($config['email'])) {
                        $config['emailkey'] = $configUp['emailkey'];
                        $config['email'] = $configUp['email'];
                    }

                    Config::createConfig($config);
                }

                if(file_exists($base . "offline")) {
                    Helper::recurseDelete(PATH_HOME . "_config/offline");
                    Helper::recurseCopy($base . "offline", PATH_HOME . "_config/offline");
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
        Helper::recurseDelete(PATH_HOME . "assetsPublic");
        Helper::recurseDelete(PATH_HOME . "templates_c");

        //gera core novamente com base nos param.json em _config
        $param = (file_exists(PATH_HOME . "_config/param.json") ? json_decode(file_get_contents(PATH_HOME . "_config/param.json"), !0) : ['js' => [], 'css' => []]);
        Config::createCore();
        $this->createCoreFont($param['font'], $param['icon'], 'fonts');
        $this->createCoreImages($dados);

        /**
         * AppCore JS Generator
         */
        $m = new \MatthiasMullie\Minify\JS(PATH_HOME . VENDOR . "config/public/assets/jquery.min.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/touch.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/moment.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/toast.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/mustache.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/idb.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/indexedDB.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/appCore.js");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/jquery-migrate.1.4.1.min.js");

        $m->minify(PATH_HOME . "assetsPublic/appCore.min.js");


        /**
         * AppCore Dashboard JS Generator
         */
        if(file_exists(PATH_HOME . VENDOR . "dashboard/public/view/dashboard.php")) {
            $m = new \MatthiasMullie\Minify\JS(PATH_HOME . VENDOR . "config/public/assets/draggable.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/mask.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/grid.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/formValidate.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/form.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/apexcharts.js");
            $m->add(PATH_HOME . VENDOR . "config/public/assets/grafico.js");

            $m->minify(PATH_HOME . VENDOR . "dashboard/public/assets/appCoreDashboard.js");
        }

        /**
         * AppCore CSS Generator
         */
        $m = new \MatthiasMullie\Minify\CSS(PATH_HOME . VENDOR . "config/public/assets/normalize.css");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/toast.css");
        $m->add(PATH_HOME . VENDOR . "config/public/assets/app.css");
        $m->minify(PATH_HOME . "assetsPublic/appCore.min.css");

        /**
         * tableCore Generator
         */
        if (!file_exists(PATH_HOME . "assetsPublic/tableCore.min.js")) {
            $minifier = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "table/public/assets/table.js"));
            $minifier->add(PATH_HOME . VENDOR . "table/public/assets/pagination.js");

            $f = fopen(PATH_HOME . "assetsPublic/tableCore.min.js", "w");
            fwrite($f, trim(preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/', '', $minifier->minify())));
            fclose($f);
        }

        /**
         * tableReportCore Generator
         */
        if (!file_exists(PATH_HOME . "assetsPublic/tableReportCore.min.js")) {
            $minifier = new \MatthiasMullie\Minify\JS(file_get_contents(PATH_HOME . VENDOR . "report/public/assets/reportRead.js"));
            $minifier->add(file_get_contents(PATH_HOME . VENDOR . "report/public/assets/reportTable.js"));
            $minifier->add(file_get_contents(PATH_HOME . VENDOR . "config/public/assets/grafico.js"));

            $f = fopen(PATH_HOME . "assetsPublic/tableReportCore.min.js", "w");
            fwrite($f, trim(preg_replace('/(?:(?:\/\*(?:[^*]|(?:\*+[^*\/]))*\*+\/)|(?:(?<!\:|\\\|\'|\")\/\/.*))/', '', $minifier->minify())));
            fclose($f);
        }

        $this->checkDirBase();
        $this->copyInstallTemplate();
        $this->copyCustomSystem();
    }

    /**
     * Verifica se os diretórios padrões existem
     */
    private function checkDirBase()
    {
        Config::createDir("entity");
        Config::createDir("entity/general");
        Config::createDir("uploads");
        Config::createDir("uploads/site");
        Config::createDir("_config");
        Config::createDir("_cdn");
        Config::createDir("_cdn/vendor");
        Config::createDir("libs");
        Config::createDir("public");
        Config::createDir("public/view");
        Config::createDir("public/set");
        Config::createDir("public/get");
        Config::createDir("public/api");
        Config::createDir("public/overload");
        Config::createDir("public/react");
        Config::createDir("public/param");
        Config::createDir("public/assets");
        Config::createDir("public/menu");
        Config::createDir("public/menu/admin");
        Config::createDir("public/menu/0");
        Config::createDir("public/tpl");
        Config::createDir("public/cron");
        Config::createDir("public/entity");
        Config::createDir("assetsPublic");
        Config::createDir("assetsPublic/img");
        Config::createDir("assetsPublic/language");
    }

    /**
     * Copia os templates para o sistema em caso de atualizações
     */
    private function copyInstallTemplate()
    {
        Config::writeFile("index.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/index.txt"));
        Config::writeFile("apiView.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiView.txt"));
        Config::writeFile("apiGet.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiGet.txt"));
        Config::writeFile("apiSet.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiSet.txt"));
        Config::writeFile("apiApi.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApi.txt"));
        Config::writeFile("apiApiPublic.php", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/apiApiPublic.txt"));

        if(!file_exists(PATH_HOME . "public/menu/menu.json"))
            Config::writeFile("public/menu/menu.json", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/menu.txt"));

        if(!file_exists(PATH_HOME . "public/menu/0/menu.json"))
            Config::writeFile("public/menu/0/menu.json", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/menuAnonimo.txt"));

        if(!file_exists(PATH_HOME . "public/menu/admin/menu.json"))
            Config::writeFile("public/menu/admin/menu.json", file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/menuAdmin.txt"));

        if(!file_exists(PATH_HOME . "assetsPublic/language/pt-br.json"))
            Config::writeFile("assetsPublic/language/pt-br.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/pt-br.json"));

        if(!file_exists(PATH_HOME . "assetsPublic/language/en.json"))
            Config::writeFile("assetsPublic/language/en.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/en.json"));

        if(!file_exists(PATH_HOME . "assetsPublic/language/es.json"))
            Config::writeFile("assetsPublic/language/es.json", file_get_contents(PATH_HOME . VENDOR . "config/public/assets/language/es.json"));

        //CONSTANTES EM CONFIG
        $contantes = [];
        require_once PATH_HOME . VENDOR . "config/public/include/constantes.php";
        if(!empty($contantes) && is_array($contantes)) {
            $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
            foreach ($contantes as $contante => $value) {
                if (!isset($config[$contante]))
                    $config[$contante] = $value;
            }
            $config['dev'] = (defined('DEV') ? DEV : preg_match("/localhost\//i", $config['home']));
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

            //Remove index caso alguma biblioteca já possua
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/view/index.php") && file_exists(PATH_HOME . "public/view/index.php")) {
                if (preg_match("/<h1>Parabéns, tudo funcionando de acordo!<\/h1>/i", file_get_contents(PATH_HOME . "public/view/index.php"))) {
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
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/img");
        copy(PATH_HOME . VENDOR . "config/public/assets/dino.png", PATH_HOME . "assetsPublic/img/dino.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/file.png", PATH_HOME . "assetsPublic/img/file.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/image-not-found.png", PATH_HOME . "assetsPublic/img/img.png");
        copy(PATH_HOME . VENDOR . "config/public/assets/loading.gif", PATH_HOME . "assetsPublic/img/loading.gif");
        copy(PATH_HOME . VENDOR . "config/public/assets/nonetwork.svg", PATH_HOME . "assetsPublic/img/nonetwork.svg");

        if(file_exists(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/favicon.png")))
            copy(PATH_HOME . (!empty($config['favicon']) ? $config['favicon'] : VENDOR . "config/public/assets/favicon.png"), PATH_HOME . "assetsPublic/img/favicon.png");

        if(!empty($config['logo']) && file_exists(PATH_HOME . $config['logo']))
            copy(PATH_HOME . $config['logo'], PATH_HOME . "assetsPublic/img/logo.png");
        elseif(file_exists(PATH_HOME . "assetsPublic/img/logo.png"))
            unlink(PATH_HOME . "assetsPublic/img/logo.png");
    }

    /**
     * Minifica todos os assets das bibliotecas
     */
    private function createMinifyAssetsLib()
    {
        //Remove todos os dados das pastas de assets
        if(file_exists(PATH_HOME . "assetsPublic/view"))
            Helper::recurseDelete(PATH_HOME . "assetsPublic/view");

        Config::createViewAssets();
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
        Helper::createFolderIfNoExist(PATH_HOME . "uploads");
        Helper::createFolderIfNoExist(PATH_HOME . "uploads/site");

        $fav = \WideImage\WideImage::load(PATH_HOME . str_replace($dados['home'], '', $dados['favicon']));
        $fav->resize(256, 256, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-256.png");
        $fav->resize(192, 192, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-192.png");
        $fav->resize(144, 144, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-144.png");
        $fav->resize(96, 96, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-96.png");
        $fav->resize(72, 72, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-72.png");
        $fav->resize(48, 48, 'fill')->saveToFile(PATH_HOME . "assetsPublic/img/favicon-48.png");
    }

    /**
     * @param array $dados
     */
    private function updateServiceWorker(array $dados)
    {
        //copia service worker
        $service = file_get_contents(PATH_HOME . VENDOR . "config/public/installTemplates/service-worker.txt");
        $service = str_replace(["const VERSION = '';", "const HOME = '';", "const FAVICON = '';"], ["const VERSION = '" . number_format($dados['version'], 2) . "';", "const HOME = '" . HOME . "';", "const FAVICON = '" . $dados['favicon'] . "';"], $service);

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
            $urlOnline = $tipo === "font" ? "https://fonts.googleapis.com/css?family=" . ucfirst($item) . ":100,300,400,700" : $item;
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