<?php

namespace Config;

use Helpers\Helper;

class Config
{

    /**
     * @return array
     */
    public static function getViewPermissoes(): array
    {
        return json_decode(file_get_contents(PATH_HOME . "_config/route.json"), true);
    }

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
        if(file_exists(PATH_HOME . "service-worker.js")) {
            $serviceWorker = file_get_contents(PATH_HOME . "service-worker.js");
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
        if (!empty($vendor) || defined("DOMINIO")) {
            if (empty($vendor)) {
                $vendor = VENDOR;
                $domain = DOMINIO;
                $www = WWW;
                $protocol = SSL;
                $path = PATH_HOME . VENDOR . "config/";
            } else {
                $path = "";
            }

            $vendor = str_replace('/', '\\/', $vendor);
            $rewriteDomain = file_exists(PATH_HOME . "_config/permissoes.json") ? "" : "RewriteRule ^{$vendor}{$domain}\/public\/(.*)$ public/$1 [L]";
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
            if($fp) {
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
     * @return array
     */
    public static function getPermission(): array
    {
        $file = [];
        if(file_exists(PATH_HOME . "_config/permissoes.json")) {
            $file = json_decode(file_get_contents(PATH_HOME . "_config/permissoes.json"), true);

            //convert true string para true boolean
            if(is_array($file)) {
                foreach ($file as $setor => $datum) {
                    if (!empty($datum)) {
                        foreach ($datum as $entity => $dados) {
                            if (!empty($dados)) {
                                foreach ($dados as $action => $value)
                                    $file[$setor][$entity][$action] = $value === "true";
                            }
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
     * Cria arquivo de atualização do site
     */
    public static function updateSite()
    {
        $update = "0";
        if(file_exists(PATH_HOME . "_config/updates/update.txt"))
            $update = file_get_contents(PATH_HOME . "_config/updates/update.txt");
        $update += 1;

        Helper::createFolderIfNoExist(PATH_HOME . "_config/updates");
        $f = fopen(PATH_HOME . "_config/updates/update.txt", "w+");
        fwrite($f, $update);
        fclose($f);
    }
}