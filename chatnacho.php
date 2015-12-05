<?php

require_once 'chatnacho.class.php'; // we use this class. NOTE THAT IN THIS CONTEXT REQUIRE_ONCE WORKS EXACTLY THE SAME AS IMPORT IN JAVA.
function work() {
    if(empty($_POST['task'])) {
        return;
    }
    $task = $_POST['task']; // WE RETRIEVE THE MODE HERE BY POST.
    //$id = 0;
    $chat = new Chatnacho();
    if($task == 'sendMessage') {
        if(empty($_POST['user']) || empty($_POST['message'])) {
            return;
        }
        $user = $_POST['user'];
        $message = $_POST['message'];
        echo $chat->postNewMessage($user, $message);
        // query to database.
    }
    elseif($task == 'fieldcheck') {
        if(empty($_POST['field']) || empty($_POST['value'])) {
            return;
        }
        $field = $_POST['field'];
        if($field == "user") {
            $field = "user_name";
        }
        $value = $_POST['value'];
        if(!empty($_POST['op'])) {
            echo $chat->checkField($field, $value, $_POST['op']);
        }
        else {
            echo $chat->checkField($field, $value);
        }
        // query to database here.
    } 
    elseif($task == 'login') {
        if(empty($_POST['user']) || empty($_POST['pass'])) {
            return;
        }
        $user = $_POST['user'];
        $password = $_POST['pass'];
        echo $chat->login($user, $password);
        // query to database.
    }
    elseif($task == 'register') {
        if(empty($_POST['user']) || empty($_POST['email']) || empty($_POST['pass'])) {
            return;
        }
        $user = $_POST['user'];
        $email = $_POST['email'];
        $password = $_POST['pass'];
        echo $chat->register($user, $email, $password);
        // query to database.
    }
    elseif($task == 'retrieve') {
        echo $chat->retrieveMessages();
    }
    elseif($task == "logout") {
        echo $chat->logout();
    }
}
header('Cache-control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: text/xml');
work();
/*
elseif($mode == 'DeleteAndRetrieveNew') {
    $chat->deleteAllMessages();
}
elseif($mode == 'RetrieveNew') {
    $id = $_POST['id'];
}

if(ob_get_length()) {ob_clean();}

// Now we send some headers so that the browsers do not make cache...
header('Cache-control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Content-Type: text/xml');

echo $chat->getNewMessages($id);
*/