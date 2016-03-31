<?php
require_once 'config.php';
require_once 'nacho_error_handler.php';
session_start();
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
        $this->firephp = FirePHP::getInstance(true);
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
    
    public function login($user, $password, $changePass = false) {
        //$pass = sha1($password);
        $query = 'SELECT user_id, user_name FROM users WHERE (user_name = "' . $user . '" OR email = "' . $user . '") AND password = "' . $password . '"';
        $this->firephp->log($query, 'login query');
        $result = $this->msqli->query($query);
        $paschanged = false;
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $result->close();
            $re = $row[0];
            $re1 = $row[1];
            $_SESSION['user_id'] = $re;
            $_SESSION['username'] = $re1;  
            $paschanged = true;
        }
        else {
            $_SESSION['user_id'] = 0;
            $_SESSION['username'] = " ";
            $paschanged = false;
        }
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?><response>';
        if($changePass) {
            $response .= '<passchanged>' . $paschanged . '</passchanged>';
        }
        $response .= '<userid>' . $_SESSION['user_id'] . '</userid>';
        $response .= '<username>' . $_SESSION['username'] . '</username></response>';
        return $response;
    }
    
    public function register($user, $email, $password) {
        $user = $this->msqli->real_escape_string($user);
        $email = $this->msqli->real_escape_string($email);
        $pass = $this->msqli->real_escape_string($password);
        $query = 'INSERT INTO users (user_name, email, password)' . // sql query, inputing the message in the db.
        'VALUES (
        "' . $user . '",
        "' . $email . '",
        "' . $pass . '")';
        $result = $this->msqli->query($query);
        $query = 'SELECT user_id, user_name FROM users WHERE email = "' . $email . '"';
        $result = $this->msqli->query($query);
        if($result->num_rows == 1) {
            $row = $result->fetch_row();
            $result->close();
            $re = $row[0];
            $re1 = $row[1];
            $_SESSION['user_id'] = $re;
            $_SESSION['username'] = $re1;
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
            $response .= '<response><logout>true</logout>';
        }
        else {
            $response .= '<response><logout>false</logout>';
        }
        $response.= '</response>';
        
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
            $this->firephp->log($_SESSION['user_id'], 'session id');
            $this->firephp->log($_SESSION['username'], 'session username');
        }
        else {
            $this->firephp->log('is empty', 'the session user an id');
        }
        $resp .= '<user_id>' . $userid . '</user_id>';
        $resp .= '<username>' . $username . '</username></response>';
        return $resp;
    }
    
    function forgotPass($email) {
        //ini_set('SMTP','smtp.gmail.com');
        //ini_set('smtp_port',587);
        //$to = "$email;
        //ini_set('SMTP','smtp.gmail.com');
        //ini_set('smtp_port',587);
        $_SESSION['email'] = $email;
        //$headers = "Content-type: text/html; charset=UTF-8" . "\r\n";
        //$headers = "Content-type: text/html" . "\r\n";
        $headers = "From: Chat Nacho" . "\r\n";
        $subject = "Password Reset";
        //$message = 'Please click on the link below to reset your user password:
        //            <p><a href="http://localhost/ChatNacho/index.php?loc=changepass"><b>Reset Password</b></a></p>';
        $message = 'Please click on the link below to reset your user password:
                    <p><a href="http://chatnacho.tk/index.php?loc=changepass"><b>Reset Password</b></a></p>';
        
        $this->firephp->log($email, 'forgot email');
        $res = mail($email, $subject, $message, $headers); 
        $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
        $response .= '<response><mailsent>' . ($res ? "true" : "false") . '</mailsent>';
        $response .= '<recipient>' . $email . '</recipient></response>';
        return $response;
    }
    
    public function changePass($newPass) {
        $_SESSION['email'] = "ignaciogarcia198@gmail.com";
        $this->firephp->log($_SESSION['email'], 'email session');
        if(empty($_SESSION['email'])) {return;} 
        $email = $_SESSION['email'];
        //$pass = sha1($newPass);
        $newPass = $this->msqli->real_escape_string($newPass);
        $response = "";
        $query = 'UPDATE users SET password = "' . $newPass .'" WHERE email = "' . $email . '"';
        $this->firephp->log($query, 'query update password');
        $result = $this->msqli->query($query);
        $this->firephp->log($this->msqli->affected_rows, 'affected rows');
        if($this->msqli->affected_rows != 1) {
            unset($_SESSION['email']);
            $response = '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>';
            $response .= '<response><passchanged>false</passchanged></response>';
            return $response;
        }
        else {
            return $this->login($email, $newPass, true);
        }
    }
}
