<?php

if(!empty($_SESSION['userlogin']['id']) && !empty($variaveis[0]) && file_exists(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$variaveis[0]}.json"))
    unlink(PATH_HOME . "_cdn/userSSE/{$_SESSION['userlogin']['id']}/{$variaveis[0]}.json");