<?php
// Déclarer la constante URL
    $url    = $_SERVER['SCRIPT_NAME'];
    $tables  = ['/index.php'];
    foreach($tables, $table) {
        $verif = preg_match('#'.$table.'#', $url);
        if($verif) {
            $var = $table;
        }
    }
    $url = explode($var, $url);

// Déclarer la constante ROOT
    $root = $_SERVER['DOCUMENT_ROOT'];

// Constante URL
    define('URL', $url[0]);

// Constante ROOT
    define('ROOT', $root.URL);

// Constante MODEL
    define('MODEL', ROOT.'/model');

// Constante VIEW
    define('VIEW', ROOT.'/view');

// Constante PUBLIC
    define('PUBLIC', ROOT.'/public');