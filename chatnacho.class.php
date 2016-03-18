<?php
require_once 'config.php';
require_once 'nacho_error_handler.php';

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of chatnacho
 *
 * @author USUARIO
 */
class Chatnacho {
    /**
     * Constructor: it opens the database connection.
     */
    function __construct() {
        $this->msqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    }
    
    /**
     * Destructor: it closes the database connection.
     */
    function __destruct() {
        $this->msqli->close();
    }
    
    /**
     * It empties (truncate) all the table of messages.
     */
    public function deleteAllMessages() {
        $query = 'TRUNCATE TABLE chat';
        $result = $this->msqli->query($query);
    }
    
    
    
    public function retrieveMessages($id = 0, $alone = true) {
        if($id > 0) { // we  publish on the chat  from the first non-published message.
            $query = 'SELECT user_name, message, posted_on, message_id
            FROM chat WHERE message_id > ' . $id . ' ORDER BY message_id ASC';
        }
        else {
            $query = 'SELECT user_name, message, posted_on, message_id
            FROM (SELECT user_name, message, message_id, DATE_FORMAT(posted_on, "%H:%i:%s") AS posted_on
            FROM chat ORDER BY message_id DESC LIMIT 50) AS Last50 ORDER BY message_id ASC';
        }
        
        $result = $this->msqli->query($query);
        $response = "";
        if($alone) {
            $response .= '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response>';
        }
        if($result->num_rows) {
            // now we give the xml response
            while($row = $result->fetch_row()) {
                //$id = $row[0];
                $user_name = $row[0];
                $time = $row[2];
                $message = $row[1];
                $mess_id = $row[3];
                $response .= //'<id>' . $id . '</id>' .
                        '<user_name>' . $user_name . '</user_name>' .
                        '<time>' . $time . '</time>' .
                        '<message>' . $message . '</message>' .
                        '<mess_id>' . $mess_id . '</mess_id>';
            }
            $result->close();
        }
        $response .= '</response>';
        return $response;
    }
    
    
    
    /**
     * It sends a new message to the database.
     * @param String $user_name Name of the user posting this message
     * @param String $message Text of this message
     * @param String style '#000000 $color Font color for this message
     */
    public function postNewMessage($user, $message) {
        $user = $this->msqli->real_escape_string($user);
        $message = $this->msqli->real_escape_string($message);
        //$color = $this->msqli->real_escape_string($color);
        $query = 'INSERT INTO chat (user_name, posted_on, message) ' . // sql query, inputing the message in the db.
        'VALUES (
        "' . $user . '",
        NOW(),
        "' . $message . '");';
        //return $query;
        $result = $this->msqli->query($query);
        //return $this->msqli->affected_rows;
        if($this->msqli->affected_rows == 1) {
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response><posted>true</posted>';
        }
        
        else {
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response><posted>false</posted>';
        }
        return $response;
    }
    
    
}
