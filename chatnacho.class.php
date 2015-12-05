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
    
    public function checkField($field, $value, $op = "") {
        // query hehe
        if($op == "login") {
            $query = 'SELECT user_name FROM users WHERE user_name = ' + $value + ' OR email = ' + $value;
        }
        else {
            $query = 'SELECT ' + $field + ' FROM users WHERE ' + $field + ' = ' + $value;
        }
        $result = $this->msqli->query($query);
        $re = false;
        if($result && $result->num_rows == 1) {
            $re = true;
        }
        
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response>' . (($re) ? 'true' : 'false') . '</response>';
        return $response;
    }
    
    public function login($user, $password) {
        $pass = sha1($password);
        $query = 'SELECT user_id FROM users WHERE (user_name = ' + $user + ' OR email = ' + $user + ') AND password = ' + $pass;
        $result = $this->msqli->query($query);
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $re = $row[0];
            $_SESSION['user_id'] = $re;
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response>' . $re . '</response>';
            return $response;
        }
    }
    
    public function register($user, $email, $password) {
        $user = $this->msqli->real_escape_string($user);
        $email = $this->msqli->real_escape_string($email);
        $pass = $this->msqli->real_escape_string(sha1($password));
        $query = 'INSERT INTO users (user_name, email, password)' . // sql query, inputing the message in the db.
        'VALUES (
        "' . $user . '",
        "' . $email . '",
        "' . $pass . '")';
        $result = $this->msqli->query($query);
        $query = 'SELECT user_id FROM users WHERE email = ' + $email;
        $result = $this->msqli->query($query);
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $re = $row[0];
            $_SESSION['user_id'] = $re;
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response>' . $re . '</response>';
            return $response;
        }
    }
    
    public function retrieveMessages() {
        $query = 'SELECT message_id, user_name, message, posted_on
            FROM (SELECT message_id, user_name, message, DATE_FORMAT(posted_on, "%H:%i:%s") AS posted_on
            FROM chat ORDER BY message_id DESC LIMIT 50) AS Last50 ORDER BY message_id ASC';
        $result = $this->msqli->query($query);
        if($result.num_rows) {
            // now we give the xml response
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response>';
            while($row = $result->fetch_row()) {
                $id = $row[0];
                $user_name = $row[1];
                $time = $row[3];
                $message = $row[2];
                $response .= '<id>' . $id . '</id>' .
                        '<user_name>' . $user_name . '</user_name>' .
                        '<time>' . $time . '</time>' .
                        '<message>' . $message . '</message>';
            }
            $result->close();
            $response .= '</response>';
        
            return $response;
        }
    }
    
    public function logout() {
        unset($_SESSION['user_id']);
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response>logout</response>';
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
            $response .= '<response>posted</response>';
            return $response;
        }
    }
}
