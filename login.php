<?php

require_once 'login.class.php'; // we use this class. NOTE THAT IN THIS CONTEXT REQUIRE_ONCE WORKS EXACTLY THE SAME AS IMPORT IN JAVA.
function work() {
    if(empty($_POST['task'])) {
        return;
    }
    $task = $_POST['task']; // WE RETRIEVE THE MODE HERE BY POST.
    //$id = 0;
    $loginNacho = new Login();

    if($task == 'fieldcheck') {
        if(empty($_POST['field']) || empty($_POST['value'])) {
            return;
        }
        $field = $_POST['field'];
        if($field == "user") {
            $field = "user_name";
        }
        $value = $_POST['value'];
        if(!empty($_POST['op'])) {
            echo $loginNacho->checkField($field, $value, $_POST['op']);
        }
        else {
            echo $loginNacho->checkField($field, $value);
        }
        // query to database here.
    } 
    
    elseif($task == 'login') {
        if(empty($_POST['user']) || empty($_POST['pass'])) {
            return;
        }
        $user = $_POST['user'];
        $password = $_POST['pass'];
        echo $loginNacho->login($user, $password);
    }
    
    elseif($task == 'register') {
        if(empty($_POST['user']) || empty($_POST['email']) || empty($_POST['pass'])) {
            return;
        }
        $user = $_POST['user'];
        $email = $_POST['email'];
        $password = $_POST['pass'];
        echo $loginNacho->register($user, $email, $password);
    }
    
    elseif($task == 'finishregister') {
        echo $loginNacho->finishRegister();
    }
    
    elseif($task == "logout") {
        echo $loginNacho->logout();
        if(!empty($_POST['id'])) {
            $id = $_POST['id'];
        }
        else {
            $id = 0;
        }
        //echo $loginNacho->retrieveMessages($id, false);
    }
    
    elseif($task == "checklogin") {
        echo $loginNacho->checkLogin();
    }
    
    elseif($task == "forgotpass") {
        
        if(empty($_POST['email'])) {
            return;
        }
        $email = $_POST['email'];
        echo $loginNacho->forgotPass($email);
    }
    
    elseif($task == "changePass") {
        if(empty($_POST['newPass'])) {
            return;
        }
        $newPass = $_POST['newPass'];
        echo$loginNacho->changePass($newPass);
    }
}
header('Cache-control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: text/xml');
work();
