<?php

namespace Config;

use Helpers\Helper;
use Route\Route;
use Tholu\Packer\Packer;

class Config
{

    /**
     * Gera arquivo de configurações
     * @param array $dados
     */
    public static function createConfig(array $dados = [])
    {
        $path = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (empty($dados))
            $dados = json_decode(file_get_contents($path . "_config/config.json"), true);
        else
            self::writeFile("_config/config.json", json_encode($dados));

        $conf = "<?php\n";
        foreach ($dados as $dado => $value) {
            $value = (is_bool($value) ? ($value ? 'true' : 'false') : "'{$value}'");
            $conf .= "define('" . strtoupper(trim($dado)) . "', {$value});\n";
        }

        //atualiza versão do Service Worker
        if (file_exists($path . "service-worker.js")) {
            $serviceWorker = file_get_contents($path . "service-worker.js");
            $version = (float)explode("'", explode("const VERSION = '", $serviceWorker)[1])[0];
            $serviceWorker = str_replace("const VERSION = '{$version}'", "const VERSION = '{$dados['version']}'", $serviceWorker);
            self::writeFile("service-worker.js", $serviceWorker);
        }

        $conf .= "\nrequire_once PATH_HOME . '" . explode('/', $dados['vendor'])[0] . "/autoload.php';\nnew Route\Sessao();";

        self::writeFile("_config/config.php", $conf);
    }

    /**
     * @param string $vendor
     * @param string $domain
     * @param string $www
     * @param string $protocol
     */
    public static function createHtaccess(string $vendor = "", string $domain = "", string $www = "", string $protocol = "")
    {
        $pathHome = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (!empty($vendor) || defined("DOMINIO")) {
            if (empty($vendor)) {
                $vendor = VENDOR;
                $domain = DOMINIO;
                $www = WWW;
                $protocol = SSL;
                $path = $pathHome . VENDOR . "config/";
            } else {
                $path = "";
            }

            $vendor = str_replace('/', '\\/', $vendor);
            $rewriteDomain = "RewriteRule ^{$vendor}{$domain}\/public\/(.*)$ public/$1 [L]";
            $dados = "RewriteCond %{HTTP_HOST} ^" . ($www ? "{$domain}\nRewriteRule ^ http" . ($protocol ? "s" : "") . "://www.{$domain}%{REQUEST_URI}" : "www.(.*) [NC]\nRewriteRule ^(.*) http" . ($protocol ? "s" : "") . "://%1/$1") . " [L,R=301]";
            self::writeFile(".htaccess", str_replace(['{$dados}', '{$rewriteDomain}'], [$dados, $rewriteDomain], file_get_contents("{$path}public/installTemplates/htaccess.txt")));
        }
    }

    /**
     * @param string $url
     * @param string $content
     */
    public static function writeFile(string $url, string $content)
    {
        try {
            if (defined("PATH_HOME") && !preg_match("/^" . preg_quote(PATH_HOME, '/') . "/i", $url))
                $url = PATH_HOME . (preg_match("/^\//i", $url) ? substr($url, 1) : $url);
            elseif (!defined("PATH_HOME"))
                $url = "../../../" . $url;

            $fp = fopen($url, "w+");
            if ($fp) {
                fwrite($fp, $content);
                fclose($fp);
            }

        } catch (Exception $e) {

        }
    }

    /**
     * Cria Diretório
     * @param string $dir
     * @return string
     */
    public static function createDir(string $dir)
    {
        $path = defined("PATH_HOME") ? PATH_HOME : "../../../";
        if (!file_exists("{$path}{$dir}"))
            mkdir("{$path}{$dir}", 0777);

        return "{$path}{$dir}";
    }

    /**
     * Obtém lista de todos os dicionários de um setor
     * convert string "true" e "false" para boolean
     * Se o setor não tiver nenhuma permissão de acesso a entidade, então exclui
     * Retorna permissoes revisadas
     *
     * @param array $setorPermissions
     * @return array
     */
    private static function checkPermissionValues(array $setorPermissions): array
    {
        $file = [];
        if (!empty($setorPermissions)) {
            foreach ($setorPermissions as $entity => $permissoes) {
                $entityAllowSee = !1;
                if (!empty($permissoes)) {
                    foreach ($permissoes as $action => $allow) {
                        $file[$entity][$action] = $allow === "true";
                        if ($file[$entity][$action])
                            $entityAllowSee = !0;
                    }
                }
                if (!$entityAllowSee)
                    unset($file[$entity]);
            }
        }

        return $file;
    }

    /**
     * Obtém lista de permissões de um setor
     * @param string|null $setor
     * @return array
     */
    public static function getPermission(string $setor = null): array
    {
        $file = [];
        if (file_exists(PATH_HOME . "_config/permissoes.json")) {
            $file = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), !0);

            //convert true string para true boolean
            if (is_array($file)) {
                if (!empty($setor)) {
                    $file = self::checkPermissionValues($file[$setor] ?? []);
                } else {
                    if (is_array($file)) {
                        foreach ($file as $setor => $datum) {
                            if (is_array($datum))
                                $file[$setor] = self::checkPermissionValues($datum);
                        }
                    }
                }
            } else {
                $file = [];
            }
        }

        return $file;
    }

    /**
     * Verifica se tem permissão de acesso a este param route
     * @param array|string $param
     * @return bool
     */
    public static function paramPermission($param): bool
    {
        $setor = self::getSetor();
        return ((empty($param['setor']) || ((is_string($param['setor']) && $param['setor'] === $setor) || (is_array($param['setor']) && in_array($setor, $param['setor'])))) && (empty($param['!setor']) || ((is_string($param["!setor"]) && $param["!setor"] !== $setor) || (is_array($param["!setor"]) && !in_array($setor, $param["!setor"])))));
    }

    /**
     * @param string $entity
     * @param array $options
     * @return bool
     */
    public static function haveEntityPermission(string $entity, array $options = []): bool
    {
        $setor = self::getSetor();
        if ($setor === "admin")
            return !0;

        $permissoes = self::getPermission($setor);
        if (empty($options))
            return isset($permissoes[$entity]);

        if (empty($permissoes[$entity]))
            return !1;

        if (in_array("read", $options) && !$permissoes['read'])
            return !1;

        if (in_array("create", $options) && !$permissoes['create'])
            return !1;

        if (in_array("update", $options) && !$permissoes['update'])
            return !1;

        if (in_array("delete", $options) && !$permissoes['delete'])
            return !1;

        return !0;
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionRead(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["read"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionCreate(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["create"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionUpdate(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["update"]);
    }

    /**
     * @param string $entity
     * @return bool
     */
    public static function haveEntityPermissionDelete(string $entity): bool
    {
        return self::haveEntityPermission($entity, ["delete"]);
    }

    /**
     * Cria arquivo de atualização do site
     */
    public static function updateSite()
    {
        $update = "0";
        if (file_exists(PATH_HOME . "_config/updates/update.txt"))
            $update = file_get_contents(PATH_HOME . "_config/updates/update.txt");
        $update += 1;

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/update.txt", "w+");
        fwrite($f, $update);
        fclose($f);

        $_COOKIE['update'] = $update;
    }

    /**
     * Cria/Atualiza os caches de Vendor
     * Caso seja informado uma biblioteca em específico para ser atualizada apenas
     */
    public static function createLibsDirectory()
    {
        $libs = PATH_HOME . explode("/", VENDOR)[0];

        //delete libs
        Helper::recurseDelete($libs);
        Helper::createFolderIfNoExist($libs);
        Helper::recurseCopy(PATH_HOME . "vendor", $libs);
    }

    private static function getTiposUsuarios()
    {
        $lista = ["0", "admin"];
        foreach (Helper::listFolder(PATH_HOME . "entity/cache/info") as $info) {
            $infoData = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$info}"), !0);
            if (!empty($infoData['user']) && $infoData['user'] === 1)
                $lista[] = str_replace(".json", "", $info);
        }

        return $lista;
    }

    /**
     * Obtém os parametros da view
     *
     * @param string $view
     * @param string $libView
     * @return array
     */
    public static function getViewParam(string $view, string $libView): array
    {
        $base = [
            "version" => VERSION,
            "css" => [],
            "js" => [],
            "meta" => "",
            "font" => "",
            "title" => "",
            "descricao" => "",
            "data" => 0,
            "front" => [],
            "header" => !0,
            "navbar" => !0,
            "setor" => "",
            "!setor" => "",
            "redirect" => "403",
            "vendor" => VENDOR
        ];

        /**
         * Busca por overload, caso encontre, busca valores
         */
        $file = $view . ".json";
        $paramOverload = Config::getRoutesFilesTo("overload/{$libView}/view/{$view}", "json");
        $route = (!empty($paramOverload) ? array_values($paramOverload)[0] : PATH_HOME . ($libView === DOMINIO ? "" : VENDOR . $libView . "/") . "public/view/{$view}/{$file}");
        $param = [];

        if (file_exists($route)) {
            $param = json_decode(@file_get_contents($route), !0);

            /**
             * Convert js para array caso seja string
             */
            if (!isset($param['js']) || !is_array($param['js']))
                $param['js'] = (!empty($param['js']) && is_string($param['js']) ? [$param['js']] : []);

            /**
             * Convert css para array caso seja string
             */
            if (!isset($param['css']) || !is_array($param['css']))
                $param['css'] = (!empty($param['css']) && is_string($param['css']) ? [$param['css']] : []);

        }

        return array_merge($base, $param);
    }

    /**
     * Obtém o HTML do template
     * @param string $template
     * @return string
     */
    public static function getTemplateContent(string $template)
    {
        $setor = self::getSetor();

        /**
         * Busca template em setor public
         * Busca template em public
         * Busca template nas libs setor
         * Busca tempalte nas libs
         */
        if (file_exists(PATH_HOME . "public/tpl/{$setor}/{$template}.mustache"))
            return file_get_contents(PATH_HOME . "public/tpl/{$setor}/{$template}.mustache");

        if (file_exists(PATH_HOME . "public/tpl/{$template}.mustache"))
            return file_get_contents(PATH_HOME . "public/tpl/{$template}.mustache");

        $libs = Helper::listFolder(PATH_HOME . VENDOR);
        foreach ($libs as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}/{$template}.mustache"))
                return file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$setor}/{$template}.mustache");
        }

        foreach ($libs as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/tpl/{$template}.mustache"))
                return file_get_contents(PATH_HOME . VENDOR . $lib . "/public/tpl/{$template}.mustache");
        }

        return "";
    }

    /**
     * Obtém json from a file
     * @param string $file
     * @return array
     */
    public static function getJsonFile(string $file): array
    {
        if (file_exists($file)) {
            $file = file_get_contents($file);
            if (is_string($file) && !empty($file)) {
                $file = json_decode($file, !0);
                if (is_array($file))
                    return $file;
            }
        }

        return [];
    }

    /**
     * Obtém setor do usuário
     * @return string
     */
    public static function getSetor(): string
    {
        return !empty($_SESSION['userlogin']) ? $_SESSION['userlogin']['setor'] : "0";
    }

    public static function includeGoogleLogin()
    {
        include_once PATH_HOME . VENDOR . "login/public/view/inc/googleLogin.php";
    }

    /**
     * Retorna os setores de um sistema (alias to getSetorSystem)
     * @param string|null $sistem
     * @return array
     */
    public static function getSetores(string $sistem = null): array
    {
        return self::getSetorSystem($sistem);
    }

    /**
     * Retorna os setores de um sistema
     * @param string|null $sistem
     * @return array
     */
    public static function getSetorSystem(string $sistem = null): array
    {
        $list = [];
        foreach (Helper::listFolder(PATH_HOME . "entity/cache/info") as $item) {
            if (preg_match("/\.json$/i", $item)) {
                $info = json_decode(file_get_contents(PATH_HOME . "entity/cache/info/{$item}"), !0);
                if (isset($info['user']) && $info['user'] === 1 && (empty($sistem) || $info['system'] === $sistem))
                    $list[] = str_replace(".json", "", $item);
            }
        }

        return $list;
    }

    /**
     * Obtém lista de todos os diretórios para o caminho em public
     * considerando bibliotecas e overloads
     * @param string $dir
     * @param string|null $setor
     * @return array
     */
    public static function getRoutesTo(string $dir, string $setor = null): array
    {
        $setor = $setor ?? self::getSetor();

        /**
         * Public Setor
         */
        $list = [PATH_HOME . "public/{$dir}/" . $setor . "/"];

        /**
         * Public
         */
        $list[] = PATH_HOME . "public/{$dir}/";

        /**
         * Overload in Public
         */
        if (file_exists(PATH_HOME . "public/overload")) {
            foreach (Helper::listFolder(PATH_HOME . "public/overload") as $libOverload) {
                $list[] = PATH_HOME . "public/overload/" . $libOverload . "/{$dir}/" . $setor . "/";
                $list[] = PATH_HOME . "public/overload/" . $libOverload . "/{$dir}/";
            }
        }

        /**
         * Overload in Libs
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib) {
            if (file_exists(PATH_HOME . VENDOR . $lib . "/public/overload")) {
                foreach (Helper::listFolder(PATH_HOME . VENDOR . $lib . "/public/overload") as $libOverload) {
                    $list[] = PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/{$dir}/" . $setor . "/";
                    $list[] = PATH_HOME . VENDOR . $lib . "/public/overload/" . $libOverload . "/{$dir}/";
                }
            }
        }

        /**
         * Libs Setor
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib)
            $list[] = PATH_HOME . VENDOR . $lib . "/public/{$dir}/" . $setor . "/";

        /**
         * Libs
         */
        foreach (Helper::listFolder(PATH_HOME . VENDOR) as $lib)
            $list[] = PATH_HOME . VENDOR . $lib . "/public/{$dir}/";

        return $list;
    }

    /**
     * @param string $dir
     * @param string $extensao
     * @return array
     */
    public static function getRoutesFilesTo(string $dir, string $extensao = ""): array
    {
        $list = [];
        foreach (self::getRoutesTo($dir) as $path)
            $list = self::getFilesRoute($path, $extensao, $list);

        return $list;
    }

    /**
     * @param string $path
     * @param string $extensao
     * @param array $list
     * @return array
     */
    private static function getFilesRoute(string $path, string $extensao = "", array $list = []): array
    {
        if (file_exists($path)) {
            foreach (Helper::listFolder($path) as $item) {
                if ($item !== ".htaccess" && !is_dir($path . $item) && ($extensao === "" || pathinfo($item, PATHINFO_EXTENSION) === $extensao) && !in_array($item, array_keys($list)))
                    $list[$item] = $path . $item;
                elseif(is_dir($path . $item))
                    $list = self::getFilesRoute($path . $item . "/", $extensao, $list);
            }
        }

        return $list;
    }

    /**
     * @param string $pathCss
     * @param string|null $view
     */
    private static function setCssPrefixAndVariables(string $pathCss, string $view = null)
    {
        //troca variáveis CSS pelos valores
        $config = json_decode(file_get_contents(PATH_HOME . "_config/config.json"), !0);
        $dirTheme = (file_exists(PATH_HOME . "public/assets/theme.min.css") ? PATH_HOME . "public/assets/theme.min.css" : PATH_HOME . VENDOR . "config/public/assets/theme.min.css");
        $themeFile = file_get_contents($dirTheme);
        $theme = explode("}", explode(".theme{", $themeFile)[1])[0];
        $themeColor = explode("}", explode(".theme-text-aux{", $themeFile)[1])[0];
        $theme = explode("!important", explode("background-color:", $theme)[1])[0];
        $themeColor = explode("!important", explode("color:", $themeColor)[1])[0];

        $arrayReplace = ["../" => "", '{$home}' => HOME, '{$vendor}' => VENDOR, '{$version}' => $config['version'], '{$favicon}' => $config['favicon'], '{$logo}' => $config['logo'], '{$theme}' => $theme, '{$theme-aux}' => $themeColor, '{$publico}' => PUBLICO,
            '{{home}}' => HOME, '{{vendor}}' => VENDOR, '{{version}}' => $config['version'], '{{favicon}}' => $config['favicon'], '{{logo}}' => $config['logo'], '{{theme}}' => $theme, '{{theme-aux}}' => $themeColor, '{{publico}}' => PUBLICO];

        $file = file_get_contents(PATH_HOME . $pathCss);
        $file = str_replace(array_keys($arrayReplace), array_values($arrayReplace), $file);

        if ($view)
            $file = self::setPrefixToCssDefinition($file, ".r-" . $view);

        //Salva CSS novamente
        $f = fopen(PATH_HOME . $pathCss, "w");
        fwrite($f, $file);
        fclose($f);
    }

    /**
     * Create JS View Cache
     *
     * @param string $view
     * @param array $viewJS
     * @param string $setor
     */
    public static function createPageJs(string $view, array $viewJS, string $setor)
    {
        $minifier = new \MatthiasMullie\Minify\JS("");

        /**
         * If find JS assets on view, so add all to the cache
         */
        if (!empty($viewJS)) {
            foreach ($viewJS as $viewJ)
                $minifier->add($viewJ);
        }

        //Save JS view to the cache
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view/{$setor}");
        $minifier->minify(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.js");
    }

    /**
     * Create CSS View Cache
     *
     * @param string $view
     * @param array $viewCss
     * @param string $setor
     */
    public static function createPageCss(string $view, array $viewCss, string $setor)
    {
        $minifier = new \MatthiasMullie\Minify\CSS("");

        /**
         * If find CSS assets on view, so add all to the cache
         */
        if (!empty($viewCss)) {
            foreach ($viewCss as $css)
                $minifier->add($css);
        }

        //Save CSS view to the cache
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view");
        Helper::createFolderIfNoExist(PATH_HOME . "assetsPublic/view/{$setor}");
        $minifier->minify(PATH_HOME . "assetsPublic/view/{$setor}/{$view}.min.css");
        self::setCssPrefixAndVariables("assetsPublic/view/{$setor}/{$view}.min.css", $view);
    }

    /**
     * Seta prefixo em todas as definições CSS do arquivo CSS passado
     *
     * @param string $css
     * @param string $prefix
     * @return string|string[]|null
     */
    private static function setPrefixToCssDefinition(string $css, string $prefix)
    {
        # Wipe all block comments
        $css = preg_replace('!/\*.*?\*/!s', '', $css);

        $parts = explode('}', $css);
        $keyframeStarted = false;
        $mediaQueryStarted = false;

        foreach ($parts as &$part) {
            $part = trim($part); # Wht not trim immediately .. ?
            if (empty($part)) {
                $keyframeStarted = false;
                continue;
            } else # This else is also required
            {
                $partDetails = explode('{', $part);

                if (strpos($part, 'keyframes') !== false) {
                    $keyframeStarted = true;
                    continue;
                }

                if ($keyframeStarted) {
                    continue;
                }

                if (substr_count($part, "{") == 2) {
                    $mediaQuery = $partDetails[0] . "{";
                    $partDetails[0] = $partDetails[1];
                    $mediaQueryStarted = true;
                }

                $subParts = explode(',', $partDetails[0]);
                foreach ($subParts as &$subPart) {
                    if (trim($subPart) === "@font-face") continue;
                    else $subPart = $prefix . (preg_match('/^(html|body)/i', $subPart) ? str_replace(['html ', 'body ', 'html', 'body'], [" ", " ", "", ""], $subPart) : ' ' . trim($subPart));
                }

                if (substr_count($part, "{") == 2) {
                    $part = $mediaQuery . "\n" . implode(', ', $subParts) . "{" . $partDetails[2];
                } elseif (empty($part[0]) && $mediaQueryStarted) {
                    $mediaQueryStarted = false;
                    $part = implode(', ', $subParts) . "{" . $partDetails[2] . "}\n"; //finish media query
                } else {
                    if (isset($partDetails[1])) {   # Sometimes, without this check,
                        # there is an error-notice, we don't need that..
                        $part = implode(', ', $subParts) . "{" . $partDetails[1];
                    }
                }

                unset($partDetails, $mediaQuery, $subParts); # Kill those three ..
            }
            unset($part); # Kill this one as well
        }

        # Finish with the whole new prefixed string/file in one line
        return (preg_replace('/\s+/', ' ', implode("} ", $parts)));
    }

    /**
     * @param array $metadados
     * @return array
     */
    public static function createInfoFromMetadados(array $metadados): array
    {
        $data = [
            "identifier" => 0, "title" => null, "link" => null, "status" => null, "date" => null, "datetime" => null, "valor" => null, "email" => null, "tel" => null, "cpf" => null, "cnpj" => null, "cep" => null, "time" => null, "week" => null, "month" => null, "year" => null,
            "required" => null, "unique" => null, "publisher" => null, "constant" => null, "extend" => null, "extend_mult" => null, "list" => null, "list_mult" => null, "selecao" => null, "selecao_mult" => null
        ];

        foreach ($metadados as $i => $dados) {
            if (in_array($dados['key'], ["unique", "extend", "extend_mult", "list", "list_mult", "selecao", "selecao_mult"]))
                $data[$dados['key']][] = $i;

            if (in_array($dados['format'], ["title", "link", "status", "date", "datetime", "valor", "email", "tel", "cpf", "cnpj", "cep", "time", "week", "month", "year"]))
                $data[$dados['format']] = $i;

            if ($dados['key'] === "publisher")
                $data["publisher"] = $i;

            if ($dados['default'] === false)
                $data['required'][] = $i;

            if (!$dados['update'])
                $data["constant"][] = $i;
        }

        return $data;
    }
}