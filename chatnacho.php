<?php

require_once 'chatnacho.class.php'; // we use this class. NOTE THAT IN THIS CONTEXT REQUIRE_ONCE WORKS EXACTLY THE SAME AS IMPORT IN JAVA.
function work() {
    $alone = false;
    if(empty($_POST['task'])) {
        return;
    }
    $task = $_POST['task']; // WE RETRIEVE THE MODE HERE BY POST.
    $id = 0;
    $chat = new Chatnacho();
    
    if($task == 'sendMessage') {
        if(empty($_POST['user']) || empty($_POST['message'])) {
            return;
        }
        $user = $_POST['user'];
        $message = $_POST['message'];
        echo $chat->postNewMessage($user, $message);
        if(!empty($_POST['id'])) {
            $id = $_POST['id'];
        }
        $alone = false;
        //echo $chat->retrieveMessages($id, false);
        // query to database.
    }

    elseif($task == 'retrieve') {
        if(!empty($_POST['id'])) {
           $id = $_POST['id'];
           $alone = true;    
        }
    }
    
    echo $chat->retrieveMessages($id, $alone);
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