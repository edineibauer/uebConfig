<?php

/**
 * Conn [ CONEXÃO ]
 * Classe abstrata de conexão. Padrão SingleTon.
 * Retorna um objeto PDO pelo método estático getConn();
 *
 * @copyright (c) 2017, Edinei J. Bauer
 */

class Conn
{
    private $host;
    private $user;
    private $pass;
    private $database;
    private $result;

    /**
     * Conn constructor.
     * @param string $host
     * @param string $user
     * @param string $pass
     * @param string|null $database
     */
    public function __construct(string $host, string $user, string $pass, string $database = null)
    {
        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        $this->database = $database;
    }

    /**
     * Verifica se credenciais e database Mysql exist
     * @return bool
     */
    public function databaseExist(): bool
    {
        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->database;
            $options = [\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'];
            $connect = new \PDO($dsn, $this->user, $this->pass, $options);
            $connect->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            return true;

        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Verifica se credenciais Mysql estão corretas
     * @return bool
     */
    public function credenciais(): bool
    {
        try {
            $dsn = 'mysql:host=' . $this->host . ';';
            $options = [\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'];
            $connect = new \PDO($dsn, $this->user, $this->pass, $options);
            $connect->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
            return true;

        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Cria a database informada no construtor
     */
    public function createDatabase()
    {
        try {
            $dsn = 'mysql:host=' . $this->host . ';';
            $options = [\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'];
            $connect = new \PDO($dsn, $this->user, $this->pass, $options);
            $connect->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            $command = $connect->prepare("CREATE DATABASE {$this->database}");
            $command->execute();

        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Verifica se database esta vazia
     */
    public function databaseIsEmpty()
    {
        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->database;
            $options = [\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'];
            $connect = new \PDO($dsn, $this->user, $this->pass, $options);
            $connect->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            $command = $connect->prepare("show tables");
            $command->setFetchMode(\PDO::FETCH_ASSOC);
            $command->execute();
            return empty($command->fetchAll());

        } catch (\PDOException $e) {
            return false;
        }
    }

    /**
     * Limpa as tabelas presentes na database
     */
    public function clearDatabase()
    {
        try {
            $dsn = 'mysql:host=' . $this->host . ';dbname=' . $this->database;
            $options = [\PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES UTF8'];
            $connect = new \PDO($dsn, $this->user, $this->pass, $options);
            $connect->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);

            $command = $connect->prepare("show tables");
            $command->setFetchMode(\PDO::FETCH_ASSOC);
            $command->execute();
            $results = $command->fetchAll();

            if(!empty($results)) {
                foreach ($results as $result) {
                    foreach ($result as $dba => $table){
                        $command = $connect->prepare("DROP TABLE IF EXISTS {$table}");
                        $command->execute();
                    }
                }
            }

        } catch (\PDOException $e) {
            return false;
        }
    }
}
