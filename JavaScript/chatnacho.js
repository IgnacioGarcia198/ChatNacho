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
    var updateInterval = 500;
    var fieldExecuting = false;
    var xhr;
    var logged = false;
    var managerRunning = false;
    var debugMode = true;
    loadChat();
//==========================================================================================
//                             WITHIN THE CHAT PAGE
//=====================================================================================
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
            $logoutLink = $chatDiv.find('#logoutLink'),
            $chatWindow = $('#chatWindow'),
            //$chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input'),
            $userChat = $input.find('#userChat'),
            $sendBtn = $input.find('#sendBtn'),
            $msgbox = $input.find('#msgbox');
            $loginLink.on('click', loadLogin);
            $regLink.on('click', loadReg);
            $logoutLink.on('click', orderLogout);
            
            if(logged) {
                $loginLink.addClass('hidden');
                $regLink.addClass('hidden');
                $logoutLink.removeClass('hidden');
            }
            else {
                $logoutLink.addClass('hidden');
                $loginLink.removeClass('hidden');
                $regLink.removeClass('hidden');
                $msgbox.on("focus", function() {
                    var val = $userChat.val();
                    if(typeof val === "undefined" || val === "") {
                        randomGuest();
                    } 
                });
            }
            
            orderRetrieveMessages();
            
            $sendBtn.on('click', orderSendMessage);
            
            /**
             * Function triggered when clicking "send message" button.
             * @returns {undefined}
             */
            function orderSendMessage() {
                //alert($msgbox.val());
                //var pep = $msgbox.val()
                var message = trim($msgbox.val());
                if(typeof message === 'undefined' || message === "") {
                    alert("sending empty messages is not allowed");
                    return;
                }
                alert("send message");
                
                var msgPost = "task=sendMessage" + "&" + 
                "user=" + encodeURIComponent(trim($userChat.val())) + "&" + "message=" + encodeURIComponent(message);   
                tasks.push(new QueueTask(msgPost, afterResponseSendMessage));
                alert(msgPost);
                if(!managerRunning) {
                    manageTasks();
                }
            }
            
            /**
             * What we will do after handling the server response of sending a message to the chat.
             * @param {type} res
             * @returns {undefined}
             */
            function afterResponseSendMessage(res) {
                alert(res);
                if(res === "posted") {
                    alert("post ok");
                    $msgbox.val("");
                    // the process was ok...

                    //setTimeout(manageTasks, updateInterval);
                }
                else {
                    alert("Sorry, there was an error when trying to post your message. Retrying...");
                    setTimeout("sendMessage(task);", updateInterval);
                }
            }
            
        
            function orderRetrieveMessages() {
                alert("retrieve"); 
                tasks.push(new QueueTask("task=retrieve", afterResponseRetrieveMessages, true));
                if(!managerRunning) {
                    manageTasks();
                }
            }
            
            function afterResponseRetrieveMessages(res) {
                $chatWindow.html(res);
            }
            
            function orderLogout() {
                alert("logout"); 
                tasks.push(new QueueTask("task=logout", function(res) {
                    if(res === "logout") {
                        logged = false;
                    }
                }));
            }
            
            function randomGuest() {
                $userChat.val("Guest" + Math.floor(Math.random() * 1000));
            }
        }); 
    }
    
    //==========================================================================================
//                             END OF THE CHAT THINGS
//=====================================================================================
    
    
    
    //==========================================================================================
//                             WITHIN THE LOGIN PAGE
//=====================================================================================
    /**
     * Loads the login page from its file
     * @returns {undefined}
     */
    function loadLogin() {
        alert("load login");
        $mainFrame.html("");
        //var correct = false;
        
        $mainFrame.load("login.html", function() {
            var $loginDiv = $mainFrame.find('#loginDiv'),
            $userLogin = $loginDiv.find('#userLogin'),
            $testUserLogin = $loginDiv.find('#testUserLogin'),
            $passLogin = $loginDiv.find('#passLogin'),
            $testPas = $loginDiv.find('#testPas'),
            $goLogin = $loginDiv.find('#goLogin'),
            $regLink2 = $loginDiv.find('#regLink2'),
            $forgotPass = $loginDiv.find('#forgotPass');
            
            var flags = {
                us : false,
                pas : false
            };
            var minlength = 6;
            /**
             * CHECK THE USER
             * @returns {undefined}
             */
            /*$userLogin.on("input", function() {
                //alert(this.value);
                fieldIsInDatabase(trim(this.value), "user", "login", function(res) {
                    if(res === "true") {
                        alert("hello");
                        $testUserLogin.html("User correct");
                        correct = true;
                    }
                    else {
                        $testUserLogin.html("User does not exist");
                        correct = false;
                    }
                });
            });*/
            checkField($userLogin, "user", flags, "us", $testUserLogin, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "Valid user", "That user is not in database", false, "login");
            
            checkPass($passLogin, $testPas, minlength, flags, "pas");
            
            $goLogin.on('click', sendLogin);
            /**
             * Function triggered when clicking on "go" button.
             * @returns {undefined}
             */
            function sendLogin() {
                alert("send login");
                if(!flags['us']) {
                    alert("Bad user name");
                    return;
                }

                if(!flags['pas']) {
                    alert("Bad password");
                    return;
                }
                
                var loginPost = "task=login&user=" + encodeURIComponent(trim($userLogin.val())) + "&" + 
                "pass="  + encodeURIComponent($passLogin.val());
                tasks.push(new QueueTask(loginPost, afterResponseLogin));
                if(!managerRunning) {
                    manageTasks();
                }
                // send to the login.php or whatever
            }
            
            function afterResponseLogin(res) {
                alert(res);
                alert(parseInt(res));
                if(parseInt(res) > 0) {
                    logged = true;
                }
                tasks = [];
                resetManager();
                loadChat();
            }
        });   
    }
    
    //==========================================================================================
//                             END OF THE LOGIN THINGS
//=====================================================================================
    
      
    //==========================================================================================
//                             WITHIN THE REGISTER PAGE
//=====================================================================================
    /**
     * Loads the register page from its file
     * @returns {undefined}
     */
    function loadReg() {
        alert("load reg");
        //var us = false, em = false, pas = false, confpas = false;
        var minlength = 6;
        var flags = {us : false, pas : false, confpas : false};
        //alert("flags: " + flags['us']);
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
            var $testReg = $regDiv.find('#testReg');
            //$testReg.html("matches");
            $userReg.val("aligatoR25");
            $emailReg.val("aligator25@cona.com");
            $passReg.val("22TTjfd");
            $confirmPass.val("22TTjfd");
            $goReg.on('click', sendReg);
            
            
            checkField($userReg, "user", flags, "us", $testUserReg, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "That user is already registered. Please login or pick another user name.", "Valid user name", true);
            checkField($emailReg, "email", flags, "em", $testEmail, "^[a-z0-9]+@[a-z]+\\.[a-z]{2,3}$", minlength,
            "That email address is already registered. Please login or write a different email.", "Valid email address", true);
 
            /**
             * CHECK THE PASSWORD
             */
            
            checkPass($passReg, $testPass, minlength, flags, "pas");
            /*$passReg.on("input", function() {
                if(match(this.value, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength, $testPass)) {
                    $testPass.html("Password correct!");
                    flags.pas = true;
                }
                else {
                    $testPass.html("Password not good enough...");
                    flags.pas = false;
                }
            });*/
            
            /**
             * CHECK PASSWORD CONFIRMATION
             */
            $confirmPass.on("input", function() {
                var val = this.value;
                if((typeof val) === "undefined" || val === "" || val !== $passReg.val()) {
                    $testConfirmPass.html("Password does not match");
                    flags.confpas = false;
                }
                else {
                    $testConfirmPass.html("Password confirmed");
                    flags.confpas = true;
                }
            });

            /**
             * Function triggered when clicking on the "go" button.
             * @returns {undefined}
             */
            function sendReg() {
                //alert("flag: " + flags['us']);
                if(!flags['us']) {
                    alert("Bad user name");
                    return;
                }
                if(!flags['em']) {
                    alert("Bad email");
                    return;
                }
                if(!flags['pas']) {
                    alert("Bad password");
                    return;
                }
                if(!flags['confpas']) {
                    alert("Pasword does not match");
                    return;
                }
                alert("no errror");
                var regt = ["task=register", "user=" + encodeURIComponent($userReg.val()), 
                "email=" + encodeURIComponent($emailReg.val()),
                "pass=" + encodeURIComponent($passReg.val())];
                var regPost = regt.join("&");
                alert(regPost);
                tasks.push(new QueueTask(regPost, afterResponseRegister));
                if(!managerRunning) {
                    alert("run manager");
                    manageTasks();
                }
                else {
                    alert("manager is running");
                }
            }
            
            function afterResponseRegister(res) {
                
                if(parseInt(res) > 0) {
                    logged = true;
                }
                tasks = [];
                resetManager();
                loadChat();
            }
        });
    }
    
    //==========================================================================================
//                             END OF THE REGISTER THINGS
//=====================================================================================
    
    /**
     * Manages a queue of tasks. Also there are things missing here...
     * @returns {undefined}
     */
    function manageTasks() {
        managerRunning = true;
        if(tasks.length > 0) {
            var next = tasks.shift();
            executeTask(next);
            /*
            var nextTask = next.task;
            //alert(nextTask);
            var taskName = nextTask.substring(nextTask.indexOf('=')+1, nextTask.indexOf('&'));
            if(taskName === "login") {
                postLogin(nextTask);
            }
            else if(taskName === "register") {
                alert("task register");
                postReg(nextTask);
            }
            else if(taskName === "retrieve") {
                retrieveMessages(nextTask);
            }
            else if(taskName === "logout") {
                //logout(nextTask);
                executeTask(next);
            }
            else if(taskName === "sendMessage") {
                sendMessage(nextTask);
            }*/
        }
    }
    
    /**
     * General function, it executes the tasks being used from a higher layer of functions.
     * @param {type} task
     * @param {type} handler
     * @param {type} callback
     * @returns {undefined}
     */
    function executeTask(qtask) {
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 || xhr.readyState === 0)
                {
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = function() {
                        handleServerResponse(qtask.callback, qtask.complex);
                    }       
                    xhr.send(qtask.task);
                }
                else
                {
                    // we will try again
                    setTimeout("executeTask(task, callback);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }
    
    /**
     * General function. Handles the response for the former one.
     * @param {type} callback
     * @returns {undefined}
     */
    function handleServerResponse(callback, complex) {
        // continue if the process is completed
        if (xhr.readyState === 4)
        {
            // continue only if HTTP status is "OK"
            var status = xhr.status;
            if((status >= 200 && status < 300) || status === 304)
            {
                try
                {
                    // process the server's response
                    var response = xhr.responseText;
                    if (response.indexOf("ERRNO") >= 0
                    || response.indexOf("error:") >= 0
                    || response.length === 0)
                        throw(response.length === 0 ? "Void server response." : response);
                    
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(response, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    var res;
                    if(typeof complex === "undefined") {
                        res = docresponse.firstChild.data.toString();
                    }
                    
                    else {
                        res = extractMessages(docresponse);
                    }
                    
                    if(typeof callback !== "undefined") {
                        callback(res);
                    }
                    //resetManager();
                }
                catch(e)
                {
                    // display the error message
                    displayError(e.toString());
                }
            }
            else
            {
                // display the error message
                displayError(xhr.statusText);
            }
        }
    }
    
    function extractMessages(docresponse) {

        // retrieve the arrays from the server's response
        //idArray = docresponse.getElementsByTagName("id");
        //colorArray = docresponse.getElementsByTagName("color");
        var nameArray = docresponse.getElementsByTagName("user_name");
        var timeArray = docresponse.getElementsByTagName("time");
        var messageArray = docresponse.getElementsByTagName("message");
        var res = [];
        for(var i = 0, l = nameArray.length; i < l; i ++) {
            var name = nameArray[i].firstChild.data.toString(),
            time = timeArray[i].firstChild.data.toString(),
            message = messageArray[i].firstChild.data.toString();
            res.push('<div>[' + time + '] ' + name + ' said: <br/>' + 
            message + '</div>');
        }
        return res.join("");
        //setTimeout("requestNewMessages();", updateInterval);
    }
    
    function QueueTask(task, callback, complex) { // this is designed in order to call a function with no parameters...
        this.task = task;
        this.callback = callback;
        this.complex = complex;
    }
    

    function match(a, b, minlength, $output) {
        //alert("match goes");
        if(a.length < minlength) {
            $output.html("Too short");
            return false;
        }
        var patt = new RegExp(b, "g");
        if(patt.test(a)) {
            //$output.html("matches");
            return true;
        }
        else{
            //test("joder");
            $output.html("Not valid");
            return false;
        }
        //$testReg.html(patt.test(a));
        //return patt.test(a);
    }
    
    function checkField($input, field, flags, flag, $output, regex, minlength, msgMatch, msgNoMatch, vf, op) {
        $input.on("input", function() {
            //alert(op);
            var value = this.value;
            if(!match(value, regex, minlength, $output)) {
                //alert("regex error");
                //$testReg.html("mierda");
                //$output.html("This is not a valid " + field);
                return;
            }
            fieldIsInDatabase(trim(value), field, function(res) {
                if(res === "true") {
                    alert("hello");
                    $output.html(msgMatch);
                    flags[flag] = !vf;
                    //alert("is in");
                }
                else {
                    $output.html(msgNoMatch);
                    flags[flag] = vf;
                    //alert("is not");
                }
            }, op);
        });
    }
    
    function checkPass($input, $output, minlength, flags, flag) {
        $input.on("input", function() {
            if(match(this.value, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength, $output)) {
                $output.html("Password correct!");
                flags[flag] = true;
            }
            else {
                $output.html("Password not good enough...");
                flags[flag] = false;
            }
        });
    }
    
    /*function fieldIsInDatabase(value, field, callback, op) {
        var task = "task=fieldcheck&field=" + field + "&" + "value=" + value;
        if(typeof op !== 'undefined' && op !== "") {
            task + "op=" + op;
        }
        tasks.push(new QueueTask(task, callback));
        if(!managerRunning) {
            //alert("run manager");
            manageTasks();
        }
    }*/
    
    function fieldIsInDatabase(value, field, callback, op) {
        //alert("ehhh " + op);
        var task = "task=fieldcheck&field=" + field + "&" + "value=" + value;
        alert(task);
        if(typeof op !== 'undefined' && op !== "") {
            task += "&op=" + op;
        }
        alert(task);
        //tasks.push(task);
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 || xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = function() {
                        handleFieldInDatabase(callback);
                    };
                       
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("fieldIsInDatabase(value, field, callback, op);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }
    
    function handleFieldInDatabase(callback)
    {
        //alert("handling field state " + xhr.readyState);
        // continue if the process is completed
        if (xhr.readyState === 4)
        {
            // continue only if HTTP status is "OK"
            var status = xhr.status;
            //alert("handling outer field");
            if((status >= 200 && status < 300) || status === 304)
            {
                //alert("handling inner field");
                try
                {
                    
                    // process the server's response
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    // retrieve the document element
                    //response = xmlHttpGetMessages.responseXML.documentElement;
                    // retrieve the flag that says if the chat window has been cleared or not
                    //alert(docresponse.getElementsByTagName("clear")[0].firstChild.data);
                    var res = docresponse.firstChild.data.toString();
                    //alert("response " + xhr.responseText);
                    //alert(callback);
                    callback(res);
                    stopManager();
                    //alert("flag: " + flags['us']);
                }
                catch(e)
                {
                    // display the error message
                    displayError(e.toString());
                }
            }
            else
            {
                // display the error message
                displayError(xhr.statusText);
            }
        }
    }
    
    function stopManager() {
        managerRunning = false;
        //manageTasks();
    }
    
    function resetManager() {
        managerRunning = false;
        tasks.push("retrieve");
    }
    
    function changeToLogged() {
        logged = true;  
    }
    
    /**
    * Removes the heading and tailing blank spaces in a string (a message, in this case).
    * @param {type} s
    * @returns {unresolved}
    */
    function trim(s) {
        return s.replace(/(^\s+)|(\s+$)/g, "");
    }
    
    /**
    * This procedure displays an error as a message. Used when catching any exception.
    * @param {type} message
    * @returns {undefined}
    */
   function displayError(message)
   {
       // display error message, with more technical details if debugMode is true
       alert("Error accessing the server! "+(debugMode ? "<br/>" + message : ""));
   }
    
});

/*
 * we want to manage:
 * login and checks
 * registering and checks
 * chat messages
 * we can use a php class with some methods, and then use a php file to tell which method to run.
 */
// WE HAVE JUST MADE THE INTERFACE OMG WHAT A FUCKING SHEET
// CORRECTION: WE NEED TO REMOVE THE OPTIONS FOR THE CHECKING THINGS, AND MAYBE LEAVE JUST THE ONE FOR DELETING ALL MESSAGES.
// THE CHECK OF THE FIELDS WILL BE CARRIED OUT IN OTHER FILE MOST PROBABLY. BECAUSE IT NEEDS TO BE FAST!!!
// LOGIN AND REGISTER CANNOT BE IN THE QUEUE. NONETHELESS, THEY CAN BE CARRIED OUT IN THE SAME PHP FILE, BUT WHEN
// ANY OF THEM IS CALLED, MEANING THE USER WANTS TO LOGIN OR WANTS TO REGISTER, WE WILL EMPTY THE TASKS ARRAY.
// IT MAKES NO SENSE THAT WE KEEP PUBLISHING MESSAGES IN THE CHAT EVEN AFTER LEAVING IT TO PERFORM LOGIN OR REGISTER.
// SO: WHEN CHECKING FIELDS, AN SPECIFIC PHP FILE PERFORM THE TASK.
// AND WHEN LOGIN OR REGISTER, THE TASKS ARRAY IS EMPTIED.
// 






