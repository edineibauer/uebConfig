<?php

$data['data']['view'] = (file_exists(PATH_HOME . "_config/offline/view.json") ? json_decode(file_get_contents(PATH_HOME . "_config/offline/view.json"), !0) : []);