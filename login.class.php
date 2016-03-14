<?php
require_once 'config.php';
require_once 'nacho_error_handler.php';
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of login
 *
 * @author USUARIO
 */
class Login {
    //put your code here
    
    function __construct() {
        $this->msqli = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
    }
    
    /**
     * Destructor: it closes the database connection.
     */
    function __destruct() {
        $this->msqli->close();
    }
    
    public function checkField($field, $value, $op = "") {
        // query hehe
        //$query = "";
        //return "".$field.$value.$op;
        if($op == "login") {
            $query = 'SELECT user_name FROM users WHERE user_name = "' . $value . '" OR email = "' . $value . '"';
            //$query = "morning";
            //return $query;
        }
        else {
            $query = 'SELECT ' . $field . ' FROM users WHERE ' . $field . ' = "' . $value . '"';
            //$query = "night";
            //return $query;
        }
        //return $query;
        $result = $this->msqli->query($query);
        //return "result " . ($result->num_rows);
        $re = false;
        if($result && $result->num_rows == 1) {
            $re = true;
        }
        $result->close();
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response>' . (($re) ? 'true' : 'false') . '</response>';
        return $response;
    }
    
    public function login($user, $password) {
        $pass = sha1($password);
        $query = 'SELECT user_id, user_name FROM users WHERE (user_name = "' . $user . '" OR email = "' . $user . '") AND password = "' . $pass . '"';
        $result = $this->msqli->query($query);
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $result->close();
            $re = $row[0];
            $re1 = $row[1];
            $_SESSION['user_id'] = $re;
            $_SESSION['username'] = $user;     
        }
        else {
            $re = 0;
            $re1 = " ";
        }
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response><userid>' . $_SESSION['user_id'] . '</userid>';
        $response .= '<username>' . $_SESSION['username'] . '</username></response>';
        return $response;
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
        $query = 'SELECT user_id, user_name FROM users WHERE email = ' + $email;
        $result = $this->msqli->query($query);
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $result->close();
            $re = $row[0];
            $re1 = $row[1];
            $_SESSION['user_id'] = $re;
        }
        else {
            $re = 0;
            $re1 = "";
        }
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response><userid>' . $re . '</userid>';
        $response .= '<username>' . $re1 . '</username></response>';
        return $response;
    }
    
    public function logout() {
        unset($_SESSION['user_id']);
        unset($_SESSION['username']);
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        if(empty($_SESSION['user_id'])) {
            $response .= '<response><logoout>true</logout>';
        }
        else {
            $response .= '<response><logoout>false</logout>';
        }
        
        return $response;
    }
    
    public function checkLogin() {
        $resp = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><response>';
        $userid = 0;
        $username = " ";
        //return $resp;
        if(!(empty($_SESSION['user_id']) || empty($_SESSION['username']))) {
            $userid = $_SESSION['user_id'];
            $username = $_SESSION['username'];
        }
        $resp .= '<user_id>' . $userid . '</user_id>';
        $resp .= '<username>' . $username . '</username></response>';
        return $resp;
    }
}
