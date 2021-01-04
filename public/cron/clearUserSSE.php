<?php

/**
 * A cada 1 dia
 * Clear user SSE cache every day
 */
$hora = date("H:i");
if($hora === "04:00")
    \Helpers\Helper::recurseDelete(PATH_HOME . "_cdn/userSSE");