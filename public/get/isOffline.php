<?php

if(file_exists(PATH_HOME . "_cdn/userActivity/{$_SESSION['userlogin']['id']}/isOnline.json"))
    unlink(PATH_HOME . "_cdn/userActivity/{$_SESSION['userlogin']['id']}/isOnline.json");