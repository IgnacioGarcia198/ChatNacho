<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <meta charset="UTF-8">
        <title>Chat Nacho</title>
        <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
        <!--<link rel="stylesheet" href="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.css">-->
        <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
        <script src="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="css/chatnacho.css" type="text/css">
    </head>
    <body>
        <div class="container" id="mainFrame">
            <div id="loginDiv" class="hidden">
                <h1>Login or register</h1>
                <div id="login">
                    User name: <input id="userLogin" type="text" maxlength="10" size="10" /><br>
                    Password: <input id="passLogin" type="password" maxlength="10" size="10" /><br>
                    <input id="goLogin" type="button" value="GO!" />
                    <a id="forgotPass">Forgot your password?</a> Don't have an account? <a id="regLink2">Register</a>
                </div>

                <div id="register">
                    Already have an account? <a id="loginLink2">Login</a>
                    User name: <input id="userReg" type="text" maxlength="10" size="10" /><br>
                    email: <input id="emailReg" type="text" maxlength="40" size="40" /><br>
                    Password: <input id="passReg" type="password" maxlength="10" size="10" /><br>
                    Confirm password: <input id="confirmPass" type="password" maxlength="10" size="10" /><br>
                    <input id="goReg" type="button" value="GO!" />
                </div>
            </div>
            
            <div id="chatDiv">
                <h2>This is the Chat Nacho</h2>
                <a id="loginLink">Login</a> or <a id="regLink">Register</a>
                <div id="chatWindow"></div><br>
                <div id="input">
                    User name: <input id="usertxtbox" type="text" maxlength="10" size="10" /><br>
                    Message:<br>
                    <textarea id="msgbox" rows="4" cols="40"></textarea> 
                    <input id="sendBtn" type="button" value="Send" />
                </div>
                <div>
                    <table class="chatToolbar">
                        <tr>
                            <td><b>B</b></td>
                            <td><i>I</i></td>
                            <td style="text-decoration: underline">U</td>
                            <td>Link</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <script type="text/javascript" src="JavaScript/chatnacho.js"></script>
    </body>
    <!-- Lo que vamo a hacer: 1. la div debe estar deshabilitada para escritura. Ya lo está por defecto chorravaina
    2. necesitamos una database en la cual vamos a mantener:
    - nombres de usuarios
    - contraseñas
    - mensajes del chat hasta un cierto máximo (p.ejemplo, 100 msages). Tb mensajes más antiguos de 1 semana se borran si no
    se llega a 100.
    - cuando se está logueado, lo de usuario queda deshabilitado.
    - si no, se obtendrá un random username y se deshabilita también para que no se pueda cambiar.
    
    - When we write a message on the chat:
    1. The message goes to the database. Having in account that the guests have no password.
    2. When somebody writes, and the service is not already running, we start the service which copies all the messages 
    not copied yet to the database until the present message. This is triggered when we press enter or click send, in such a way
    that it has to check if the last id copied is less than its own one.
    -->
</html>
