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
            
            function randomGuest() {
                $userChat.val("Guest" + Math.floor(Math.random() * 1000));
            }
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
                tasks.push(msgPost);
                alert(msgPost);
                if(!managerRunning) {
                    manageTasks();
                }
            }
            
            function orderRetrieveMessages() {
                alert("retrieve"); 
                //tasks.push("task=retrieve");
                /*if(!managerRunning) {
                    manageTasks();
                }*/
            }
            
            function orderLogout() {
                alert("logout"); 
                tasks.push("task=logout");
            }
            
            function sendMessage(task) {
            executeTask(task, handleSendMessage);
    }
    
    /*function sendMessage(task) {
        executeTask(task, function() {
            // call the server page to execute the server-side operation
            xhr.open("POST", 'chatnacho.php', true);
            xhr.setRequestHeader("Content-Type",
            "application/x-www-form-urlencoded");
            xhr.onreadystatechange = handleLogout;
            xhr.send(task);
        });
    }*/
    
            function handleSendMessage() {
                handleServerResponse(function(res) {
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
                });
                stopManager();
            }
        }); 
    }
    
    function stopManager() {
        managerRunning = false;
        //manageTasks();
    }
    
    function resetManager() {
        managerRunning = false;
        tasks.push("retrieve");
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
            });
 
            $goLogin.on('click', sendLogin);
            /**
             * Function triggered when clicking on "go" button.
             * @returns {undefined}
             */
            function sendLogin() {
                alert("send login");
                var loginPost = "task=login&user=" + encodeURIComponent(trim($userLogin.val())) + "&" + 
                "pass="  + encodeURIComponent($passLogin.val());
                tasks.push(loginPost);
                if(!managerRunning) {
                    manageTasks();
                }
                // send to the login.php or whatever
            }
        });   
    }
   
    function manageTasks() {
        managerRunning = true;
        if(tasks.length > 0) {
            var nextTask = tasks.shift();
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
                logout(nextTask);
            }
            else if(taskName === "sendMessage") {
                sendMessage(nextTask);
            }
        }
    }
    
    function retrieveMessages(task) {
        
    }
    
    function executeTask(task, handler) {
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
                    xhr.onreadystatechange = handler;
                    xhr.send(task);
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
    
    function handleServerResponse(callback) {
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
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    var res = docresponse.firstChild.data.toString();
                    
                    callback(res);
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
    
    function logout(task) {
        executeTask(task, handleLogout);
    }
    
    function handleLogout() {
        handleServerResponse(function(res) {
            if(res === "logout") {
                logged = false;
            }
        });
        resetManager();
    }
    
    /*function logout(task) {
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 ||
                xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = handleLogout;
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("postLogin(task);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }*/
    
    /*function handleLogout() {
        // continue if the process is completed
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            // continue only if HTTP status is "OK"
            if (xhr.status === 200)
            {
                try
                {
                    tasks = [];
                    // process the server's response
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    var res = docresponse.firstChild.data.toString();
                    if(res == "logout") {
                        logged = false;
                    }
                    //callback(res);
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
    }*/
    
    
    
    /*function sendMessage(task) {
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 ||
                xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = handleSendMessage;
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("postLogin(task);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }*/
    /*
    function handleSendMessage(task) {
        // continue if the process is completed
        if (xhr.readyState === 4)
        {
            // continue only if HTTP status is "OK"
            var status = xhr.status;
            if((status >= 200 && status < 300) || status === 304)
            {
                try
                {
                    //tasks = [];
                    // process the server's response
                    alert("response: " + xhr.responseText);
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    // retrieve the document element
                    //response = xmlHttpGetMessages.responseXML.documentElement;
                    // retrieve the flag that says if the chat window has been cleared or not
                    //alert(docresponse.getElementsByTagName("clear")[0].firstChild.data);
                    var res = docresponse.firstChild.data.toString();
                    alert(res);
                    if(res == "posted") {
                        // the process was ok...
                        stopManager();
                        //setTimeout(manageTasks, updateInterval);
                    }
                    else {
                        alert("Sorry, there was an error when trying to post your message. Retrying...");
                        setTimeout("sendMessage(task);", updateInterval)
                    }
                    //$msgbox
                    //stopManager();
                    
                    //callback(res);
                }
                catch(e)
                {
                    // display the error message
                    alert("exception: " + e.toString());
                    displayError(e.toString());
                }
            }
            else
            {
                // display the error message
                displayError(xhr.statusText);
            }
        }
    }*/
    
    function postLogin(task) {
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 ||
                xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = handleLogin;
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("postLogin(task);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }
    
    function handleLogin() {
        // continue if the process is completed
        if (xhr.readyState === 4)
        {
            // continue only if HTTP status is "OK"
            var status = xhr.status;
            if((status >= 200 && status < 300) || status === 304)
            {
                try
                {
                    tasks = [];
                    // process the server's response
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    // retrieve the document element
                    //response = xmlHttpGetMessages.responseXML.documentElement;
                    // retrieve the flag that says if the chat window has been cleared or not
                    //alert(docresponse.getElementsByTagName("clear")[0].firstChild.data);
                    var user_id = docresponse.firstChild.data.toString();
                    if(parseInt(user_id) > 0) {
                        logged = true;
                    }
                    resetManager();
                    //callback(res);
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
    
    function changeToLogged() {
        logged = true;
        
    }
    
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
            
            
            checkFieldRegister($userReg, "user", "us", $testUserReg, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength);
            checkFieldRegister($emailReg, "email", "em", $testEmail, "^[a-z0-9]+@[a-z]+\\.[a-z]{2,3}$", minlength);
            
            //alert("flag: " + flags['us']);
            /**
             * CHECK THE USER
             */
            /*$userReg.on("input", function() {
                checkFieldReg("user", $testUserReg);
            });*/
            /*$userReg.on("input", function() {
                alert(this.value);
                fieldIsInDatabase(trim(this.value), "user", "", function(res) {
                    if(res === "true") {
                        alert("hello");
                        $testUserReg.html("User already in database");
                        us = false;
                    }
                    else {
                        $testUserReg.html("Valid user");
                        us = true;
                    }
                });
            });*/
            
            /**
             * CHECK THE EMAIL
             */
            /*$emailReg.on("input", function() {
                alert(this.value);
                fieldIsInDatabase(trim(this.value), "email", "", function(res) {
                    if(res === "true") {
                        alert("hello");
                        $testEmail.html(" Email already in database");
                        em = false;
                    }
                    else {
                        $testEmail.html("Valid email");
                        em = true;
                    }
                });
                alert("flag: " + flags['us']);
            });*/
            
            /**
             * 
             * @param {type} a
             * @param {type} b
             * @returns {Boolean}
             */
            function match(a, b, minlength) {
                //alert("match goes");
                if(a.length < minlength) {
                    $testReg.html("too short");
                    return false;
                }
                var patt = new RegExp(b, "g");
                if(patt.test(a)) {
                    $testReg.html("matches");
                    return true;
                }
                else{
                    //test("joder");
                    $testReg.html("no match");
                    return false;
                }
                //$testReg.html(patt.test(a));
                //return patt.test(a);
            }
            
            function checkFieldRegister($input, field, flag, $output, regex, minlength) {
                $input.on("input", function() {
                    //alert(this.value);
                    var value = this.value;
                    if(!match(value, regex, minlength)) {
                        //$testReg.html("mierda");
                        $output.html("This is not a valid " + field);
                        return;
                    }
                    fieldIsInDatabase(trim(this.value), field, "", function(res) {
                        if(res === "true") {
                            alert("hello");
                            $output.html("That " + field + " is already in database");
                            flags[flag] = false;
                        }
                        else {
                            $output.html("Valid " + field);
                            flags[flag] = true;
                        }
                    });
            });
            }
            //checkFieldReg("user", $testUserReg);
            /*function checkFieldReg(field, $element) {
                alert($('this').val());
                fieldIsInDatabase(trim(this.value), "user", "", function(res) {
                    if(res === "true") {
                        alert("hello");
                        $element.html("That " + field + " is already in database");
                        return false;
                    }
                    else {
                        $element.html("Valid " + field);
                        return true;
                    }
                });
            }*/
            
            /**
             * CHECK THE PASSWORD
             */
            $passReg.on("input", function() {
                if(match(this.value, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength)) {
                    $testPass.html("Password correct!");
                    flags.pas = true;
                }
                else {
                    $testPass.html("Password not good enough...");
                    flags.pas = false;
                }
            });
            
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
                /*if(!flags['us']) {
                    alert("Bad username");
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
                }*/
                alert("no errror");
                var regt = ["task=register", "user=" + encodeURIComponent($userReg.val()), 
                "email=" + encodeURIComponent($emailReg.val()),
                "pass=" + encodeURIComponent($passReg.val())];
                var regPost = regt.join("&");
                alert(regPost);
                tasks.push(regPost);
                if(!managerRunning) {
                    alert("run manager");
                    manageTasks();
                }
                else {
                    alert("manager is running");
                }
            }
        });
    }
    
    function postReg(task) {
        alert("postReg");
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
                    xhr.onreadystatechange = handleReg;
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("postReg(task);", updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }
    
    function handleReg() {
        // continue if the process is completed
        if (xhr.readyState === 4)
        {
            // continue only if HTTP status is "OK"
            var status = xhr.status;
            if((status >= 200 && status < 300) || status === 304)
            {
                try
                {
                    tasks = [];
                    // process the server's response
                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(xhr.responseText, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    // retrieve the document element
                    //response = xmlHttpGetMessages.responseXML.documentElement;
                    // retrieve the flag that says if the chat window has been cleared or not
                    //alert(docresponse.getElementsByTagName("clear")[0].firstChild.data);
                    //user_id = docresponse.firstChild.data;
                    changeToLogged();
                    resetManager();
                    //callback(res);
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
    
    /**
     * Checks if the field is already in the database or not.
     * @param {type} fieltext
     * @param {type} field
     * @returns {undefined}
     */
    function fieldIsInDatabase(value, field, op, callback) {
        var task = "task=fieldcheck&field=" + field + "&" + "value=" + value;
        if(typeof op !== 'undefined' && op !== "") {
            task + "op=" + op;
        }
        //tasks.push(task);
        xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 ||
                xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'chatnacho.php', true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = function() {
                        handleFieldInDatabase(callback);
                    }
                            
                    xhr.send(task);
                }
                else
                {
                    // we will check again for new messages
                    setTimeout("fieldIsInDatabase(value, field, op);", updateInterval);
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
                    var res = docresponse.firstChild.data;
                    //alert(res);
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






