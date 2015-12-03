/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// THIS FILE NEEDS TO WORK AS A QUEUE OF TASKS TO DO. 
// WHEN A NEW MESSAGE IS SENT, WE PUT A TASK IN A QUEUE (PARAMETERS OR WHATEVER).
// THEN WE START A TIMEOUT. WE WILL CALL AGAIN THE TIMEOUT JUST IN THE CASE THE TABLE IS NOT EMPTY AFTER THAT.

$('document').ready(function() {
    var $mainFrame = $('#mainFrame');
    var tasks = [];
    loadChat();
    
    /**
     * Loads the chat page from its file
     * @returns {undefined}
     */
    function loadChat() {
        $mainFrame.html("");
        $mainFrame.load("chat.html", function() {
            var $chatDiv = $mainFrame.find('#chatDiv'),
            $loginLink = $chatDiv.find('#loginLink'),
            $regLink = $chatDiv.find('#regLink'),
            $chatWindow = $('#chatWindow'),
            //$chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input'),
            $userChat = $mainFrame.find('#userChat'),
            $sendBtn = $input.find('#sendBtn'),
            $msgbox = $input.find('#msgbox');
            $loginLink.on('click', loadLogin);
            $regLink.on('click', loadReg);
            $sendBtn.on('click', sendMessage);
            
            /**
             * Function triggered when clicking "send message" button.
             * @returns {undefined}
             */
            function sendMessage() {
                var message = trim($msgbox.html());
                if(typeof message === 'undefined' || message == "") {
                    alert("sending empty messages is not allowed");
                    return;
                }
                alert("send message");
                var msgPost = "task=sendMessage" + "&" + 
                "user=" + encodeURIComponent(trim($userChat.value)) + "&" + "message="  + encodeURIComponent(message);   
                tasks.push(msgPost);
            }
        }); 
    }
    
    /**
     * Loads the login page from its file
     * @returns {undefined}
     */
    function loadLogin() {
        alert("load login");
        $mainFrame.html("");
        var correct = false;
        $mainFrame.load("login.html", function() {
            var $loginDiv = $mainFrame.find('#loginDiv'),
            $userLogin = $loginDiv.find('#userLogin'),
            $testUserLogin = $loginDiv.find('#testUserLogin'),
            $passLogin = $loginDiv.find('#passLogin'),
            $goLogin = $loginDiv.find('#goLogin'),
            $regLink2 = $loginDiv.find('#regLink2'),
            $forgotPass = $loginDiv.find('#forgotPass');
            
            /**
             * CHECK THE USER
             * @returns {undefined}
             */
            $userLogin.on("input", function() {
                if(fieldIsInDataBase(trim(this.value)), "user") {
                    $testUserLogin.html("User correct");
                    correct = true;
                }
                else {
                    $testUserLogin.html("User does not exist");
                    correct = false;
                }
            });
 
            $goLogin.on('click', sendLogin);
            /**
             * Function triggered when clicking on "go" button.
             * @returns {undefined}
             */
            function sendLogin() {
                var loginPost = "task=login&user=" + encodeURIComponent(trim($userLogin.value)) + "&" + 
                "pass="  + encodeURIComponent($passLogin.value);
                tasks.push(loginPost);
                // send to the login.php or whatever
            }
        });   
    }
    
    /**
     * Loads the register page from its file
     * @returns {undefined}
     */
    function loadReg() {
        alert("load reg");
        var us = false, em = false, pas = false, confpas = false;
        $mainFrame.html("");
        $mainFrame.load("register.html", function() {
            var $regDiv = $mainFrame.find('#regDiv'),
            $loginLink2 = $regDiv.find('#loginLink2'),
            $userReg = $regDiv.find('#userReg'),
            $testUserReg = $regDiv.find('#testUserReg'),
            $emailReg = $regDiv.find('#emailReg'),
            $testEmail = $regDiv.find('#testEmail'),
            $passReg = $regDiv.find('#passReg'),
            $testPass = $regDiv.find('#testPass'),
            $confirmPass = $regDiv.find('#confirmPass'),
            $testConfirmPass = $regDiv.find('#testConfirmPass'),
            $goReg = $regDiv.find('#goReg');
            $goReg.on('click', sendReg);
            
            /**
             * CHECK THE USER
             */
            $userReg.on("input", function() {
                if(fieldIsInDataBase(trim(this.value)), "user") {
                    $testUserReg.html("User is already registered");
                    us = false;
                }
                else {
                    $testUserReg.html("User correct");
                    us = true;
                }
            });
            
            /**
             * CHECK THE EMAIL
             */
            $emailReg.on("input", function() {
                if(fieldIsInDataBase(trim(this.value)), "email") {
                    $testEmail.html("Email is already registered");
                    em = false;
                }
                else {
                    $testEmail.html("Email correct");
                    em = true;
                }
            });
            
            /**
             * CHECK THE PASSWORD
             */
            $passReg.on("input", function() {
                if(this.value.length < 6) {
                    $testPass.html("Password is too short");
                    pas = false;
                }
                else {
                    $testPass.html("Password correct");
                    pas = true;
                }
            });
            
            /**
             * CHECK PASSWORD CONFIRMATION
             */
            $confirmPass.on("input", function() {
                var val = this.value;
                if((typeof val) === "undefined" || val === "" || val !== $passReg.val()) {
                    $testConfirmPass.html("Password does not match");
                    confpas = false;
                }
                else {
                    $testConfirmPass.html("Password confirmed");
                    confpas = true;
                }
            });

            /**
             * Function triggered when clicking on the "go" button.
             * @returns {undefined}
             */
            function sendReg() {
                if(!us) {
                    alert("Bad username");
                    return;
                }
                if(!em) {
                    alert("Bad email");
                    return;
                }
                if(!pas) {
                    alert("Bad password");
                    return;
                }
                if(!confpas) {
                    alert("Pasword does not match");
                    return;
                }

                var regt = ["task=register", "user=" + encodeURIComponent($userReg.value), 
                "email=" + encodeURIComponent($emailReg.value),
                "pass=" + encodeURIComponent($passReg.value)];
                var regPost = regt.join("&");
                tasks.push(regPost);
            }
        });
    }
    
    /**
     * Checks if the field is already in the database or not.
     * @param {type} fieltext
     * @param {type} field
     * @returns {undefined}
     */
    function fieldIsInDatabase(value, field) {
        tasks.push("task=fieldcheck&field=" + field + "&" + "value=" + value);
        // request to a php file
    }
    
    /**
    * Removes the heading and tailing blank spaces in a string (a message, in this case).
    * @param {type} s
    * @returns {unresolved}
    */
    function trim(s) {
        return s.replace(/(^\s+)|(\s+$)/g, "");
    }
    
});

/*
 * we want to manage:
 * login and checks
 * registering and checks
 * chat messages
 * we can use a php class with some methods, and then use a php file to tell which method to run.
 */
// WE HAVE JUST MADE THE INTERFACE OMG WHAT A FUCKIN SHEET






