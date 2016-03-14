/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// THIS FILE NEEDS TO WORK AS A QUEUE OF TASKS TO DO. 
// WHEN A NEW MESSAGE IS SENT, WE PUT A TASK IN A QUEUE (PARAMETERS OR WHATEVER).
// THEN WE START A TIMEOUT. WE WILL CALL AGAIN THE TIMEOUT JUST IN THE CASE THE TABLE IS NOT EMPTY AFTER THAT.
// 
// 
//=======================================================
//Every task we run will be waiting until the last task has finished, and then will run. It would never occur that one task overlaps other one, but never know, this is asynchronous.  
//Every time we put a sendMessage task in the table, we will first empty the table. Afterwards we will put a new 
//Every time we put a login, logout or register task in the table, we will first empty the table.
//Every time we put a retrieveMessages task in the table, this will be automatically done at the end of every task handler, so we don't really need to bother about this.
//
//Whenever we reload the page, we will need to check if the session is running, and in that case, we will put the 'logged'
//to true. For this, as well as login, register and logout, we should not use the queue, and shoud disable the task manager.
//HASTA LA POLLA JJJJ
//=========================================

$('document').ready(function() {
    var $mainFrame = $('#mainFrame');
    var tasks = [];
    var updateInterval = 3000;
    var fieldExecuting = false;
    var xhr;
    var logged = false;
    var managerRunning = false;
    var debugMode = true;
    var $chatWindow, $userChat;
    var userid = 0, lastid = 0, username = "";
    var xhr = new XMLHttpRequest();
    var cycleManager = true;
    var enableManager = true;
    // check if the user is logged or not
    
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
            $welcome = $chatDiv.find('#welcome'),
            $loginLink = $chatDiv.find('#loginLink'),
            $regLink = $chatDiv.find('#regLink'),
            $logoutLink = $chatDiv.find('#logoutLink');
            $chatWindow = $('#chatWindow');
            var
            //$chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input');
            $userChat = $input.find('#userChat');
            var $sendBtn = $input.find('#sendBtn'),
            $msgbox = $input.find('#msgbox');
            $loginLink.on('click', loadLogin);
            $regLink.on('click', loadReg);
            $logoutLink.on('click', orderLogout);
            checkLogin();
            
            
            if(logged) { // if the user is logged (has performed login or register)
                $welcome.html("Welcome back, " + username);
                $loginLink.addClass('hidden');
                $regLink.addClass('hidden');
                $logoutLink.removeClass('hidden');
            }
            else {
                $welcome.html("Welcome, guest!");
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
            
            orderRetrieveMessages(); // within the chat page we have to get the messages from the db of course
            startManager(); // we start the cycle of the task manager
            //manageTasks();
            
            $sendBtn.on('click', orderSendMessage);
            
            /**
             * Function triggered when clicking "send message" button. Sends the message written in the box.
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
                
                var msgPost = "task=sendMessage" + "&user=" + encodeURIComponent(trim($userChat.val())) + 
                "&message=" + encodeURIComponent(message) + "&id=" + lastid;
                tasks = [];
                tasks.push(new QueueTask(msgPost, afterResponseSendMessage, "chatnacho.php"));
                alert(msgPost);
                /*if(!managerRunning) {
                    manageTasks();
                }*/
            }
            
            /**
             * What we will do after handling the server response of sending a message to the chat.
             * @param {xmldoc} docresponse // the response of the server parsed to xml
             * @returns {undefined}
             */
            function afterResponseSendMessage(docresponse) {
                //alert(docresponse);
                alert("sending message");
                //var posted = "true";
                var posted = docresponse.getElementsByTagName("posted")[0].firstChild.data.toString();
                alert("posted: " + posted);
                if(posted === "true") {
                    alert("post ok");
                    $msgbox.val("");
                }
                else {
                    alert("Sorry, there was an error when trying to post your message. Retrying...");
                    setTimeout(orderSendMessage, updateInterval);
                }
                $chatWindow.html(extractMessages(docresponse));
            }
            
            
            
            function randomGuest() {
                $userChat.val("Guest" + Math.floor(Math.random() * 1000));
            }
        }); 
    }
    
    /**
     * Perfoms the logout. I dedided to put this function outside of the chat thing to avoid a recursive call or  the things
     * about the closure...
     * @returns {undefined}
     */
    function orderLogout() { // I decided to put this function outside of
        alert("logout"); 
        //tasks = [];
        stopManager();
        //cycleManager = false;
        executeTask(new QueueTask("task=logout", function(docresponse) {
            var logoutres = docresponse.getElementsByTagName("logout")[0].firstChild.data.toString();
            if(logoutres === "true") {
                logged = false;
                userid = 0;
                username = "";
                //lastid = idres;  
            }
            else {
                alert("Sorry, there was an error while logging out.");
            }
            loadChat();
            $chatWindow.html(extractMessages(docresponse)); // this can be append if we mantain the page hidden...
            //tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages));
        }, "login.php"));
        //manageTasks();
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
        stopManager(); // we are not in the chat window anymore so there's no need to do cyclic retrieves of messages.
        //cycleManager = false;
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
             * Function triggered when clicking on "go" button. Performs checks and the login if everything is ok.
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
                //tasks = [];
                var loginTask = new QueueTask(loginPost, afterResponseLogin, "login.php");
                executeTask(loginTask);
                //tasks.push(new QueueTask(loginPost, afterResponseLogin));
                
                /*if(!managerRunning) {
                    manageTasks();
                }*/
                //manageTasks();
                // send to the login.php or whatever
            }
            
            function afterResponseLogin(docresponse) {
                loguser(docresponse); 
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
        //tasks = [];
        stopManager(); // same as in login
        //cycleManager = false;
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
             * Function triggered when clicking on the "go" button. Performs checks and the register if everything is ok.
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
                //tasks = [];
                var regTask = new QueueTask(regPost, afterResponseRegister, "login.php");
                executeTask(regTask);
                //tasks.push(new QueueTask(regPost, afterResponseRegister));
                /*if(!managerRunning) {
                    alert("run manager");
                    manageTasks();
                }
                else {
                    alert("manager is running");
                }*/
                //manageTasks();
            }
            
            function afterResponseRegister(docresponse) {
                loguser(docresponse);   
            }
        });
    }
    
    //==========================================================================================
//                             END OF THE REGISTER THINGS
//=====================================================================================
    /**
     * we start the manager with the tasks to repeat
     * @returns {undefined}
     */
    function startManager() {
        enableManager = true;
        manageTasks();
    }
    
    /**
     * puts the manager to rest and empties the task queue.
     * @returns {undefined}
     */
    function stopManager() {
        enableManager = false;
        tasks = [];
    }
    
    /**
     * simply check if we are logged or not.
     * @returns {undefined}
     */
    function checkLogin() {
        
        executeTask(new QueueTask("task=checklogin", function(docresponse) {
                //userid = docresponse.getElementsByTagName("user_id")[0].firstChild.data;
                alert("userid: " + userid);
                
                if(userid > 0) {
                    //username = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
                    alert("username: " + username);
                    //logged = true;
                }
                alert("logged: " + logged);
            }, "login.php"));
    }
    
    /**
     * Function 
     * @param {type} docresponse
     * @returns {undefined}
     */
    function loguser(docresponse) {
        var idres = docresponse.getElementsByTagName("userid")[0].firstChild.data;
        var name = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
        if(idres > 0) {
            logged = true;
            userid = idres;  
            username = name;
        }
        else {
            alert("Sorry, there was an error while logging. Check if your user and password are correct.");
        }
        loadChat();
        //$chatWindow.html(extractMessages(docresponse)); // this can be append if we mantain the page hidden...
        //tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages));
    }
    
    function orderRetrieveMessages() {
        alert("retrieve"); 
        tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages, "chatnacho.php"));
        /*if(!managerRunning) {
            manageTasks();
        }*/
    }

    function afterResponseRetrieveMessages(docresponse) {
        var contentToAppend = extractMessages(docresponse);
        $chatWindow.append(contentToAppend);
    }
    
    /**
     * Manages a queue of tasks. Also there are things missing here...
     * @returns {undefined}
     */
    function manageTasks() {
        //managerRunning = true;
        if(enableManager) {
            if(tasks.length > 0) {
                var next = tasks.shift();
                executeTask(next);
            }
            if(cycleManager) {
                setTimeout(manageTasks, updateInterval);
            } 
            else {
                tasks = [];
            }
        }
        //managerRunning = false;
    }
    
    /**
     * General function, it executes the tasks being used from a higher layer of functions.
     * @param {type} task
     * @param {type} handler
     * @param {type} callback
     * @returns {undefined}
     */
    function executeTask(qtask) {
        //xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 || xhr.readyState === 0)
                {
                    xhr.open("POST", qtask.file, true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = function() {
                        handleServerResponse(qtask.callback, qtask.task);
                    }       
                    xhr.send(qtask.task);
                }
                else
                {
                    // we will try again
                    setTimeout(function() {
                        executeTask(qtask);
                    }, updateInterval);
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
     * @param {Function} callback
     * @returns {undefined}
     */
    function handleServerResponse(callback, task) {
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
                    alert("task: " +  task + "\nresponse: " + response);
                    if (response.indexOf("ERRNO") >= 0
                    || response.indexOf("error:") >= 0
                    || response.length === 0)
                        throw(response.length === 0 ? "Void server response." : response);

                    var parser = new DOMParser();
                    var xmlResponse = parser.parseFromString(response, "application/xml"), // IE cannot read the response XML thing or so seems to be...
                    docresponse = xmlResponse.documentElement;
                    //alert(response);
                    /*var res;
                    if(typeof complex === "undefined") {
                        res = docresponse.firstChild.data.toString();
                    }
                    
                    else {
                        res = extractMessages(docresponse);
                    }*/
                    
                    if(typeof callback !== "undefined") {
                        callback(docresponse);
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
        var idArray = docresponse.getElementsByTagName("mess_id");
        var txtres ="";
        if(idArray.length > 0) {
            var nameArray = docresponse.getElementsByTagName("user_name");
            var timeArray = docresponse.getElementsByTagName("time");
            var messageArray = docresponse.getElementsByTagName("message");

            //alert(idArray);
            var res = [];
            for(var i = 0, l = nameArray.length; i < l; i ++) {
                var name = nameArray[i].firstChild.data.toString(),
                time = timeArray[i].firstChild.data.toString(),
                message = messageArray[i].firstChild.data.toString();
                res.push('<div>[' + time + '] ' + name + ' said: <br/>' + 
                message + '</div>');
            }
            lastid = idArray[idArray.length - 1].firstChild.data;
            alert(lastid);
            txtres = res.join("");
        }
        //setTimeout(orderRetrieveMessages, updateInterval);
        if(cycleManager) {
            tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages, "chatnacho.php"));
        }
        return txtres;
        //setTimeout("requestNewMessages();", updateInterval);
    }
    
    
    /**
     * The constructor in java for  the company
     * @param {type} task
     * @param {type} callback
     * @param {type} file
     * @returns {chatnacho_L22.QueueTask}
     */
    function QueueTask(task, callback, file) { // this is designed in order to call a function with no parameters...
        this.task = task;
        this.callback = callback;
        this.file = file;
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
    
    /**
     * Generalized function go en
     * @param {type} $input
     * @param {type} field
     * @param {type} flags
     * @param {type} flag
     * @param {type} $output
     * @param {type} regex
     * @param {type} minlength
     * @param {type} msgMatch
     * @param {type} msgNoMatch
     * @param {type} vf
     * @param {type} op
     * @returns {undefined}
     */
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
    
    /**
     * checks if the entered password is good in its regex, etc.
     * @param {type} $input
     * @param {type} $output
     * @param {type} minlength
     * @param {type} flags
     * @param {type} flag
     * @returns {undefined}
     */
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
    
    /**
     * checks if a certain value for a field is in the database.
     * @param {type} value
     * @param {type} field
     * @param {type} callback
     * @param {type} op
     * @returns {undefined}
     */
    function fieldIsInDatabase(value, field, callback, op) {
        //alert("ehhh " + op);
        var task = "task=fieldcheck&field=" + field + "&" + "value=" + value;
        //alert(task);
        if(typeof op !== 'undefined' && op !== "") {
            task += "&op=" + op;
        }
        //alert(task);
        //tasks.push(task);
        //xhr = new XMLHttpRequest();
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 || xhr.readyState === 0)
                {
                    // call the server page to execute the server-side operation
                    xhr.open("POST", 'login.php', true);
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
                    setTimeout(function() {
                        fieldIsInDatabase(value, field, callback, op);
                    }, updateInterval);
                }
            }
            catch(e)
            {
                displayError(e.toString());
            }
        }
    }
    
    /**
     * handler for the server response of the former function.
     * @param {type} callback
     * @returns {undefined}
     */
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
    
    /*function stopManager() {
        managerRunning = false;
        //manageTasks();
    }*/
    
    /*function resetManager() {
        managerRunning = false;
        tasks.push("retrieve");
    }*/
    
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
 * Everything here was a tremendous bad thing and now we try to fix it bit by bit.
 * I put a separate file for all user login purposes, called login.php, calling login.class.php.
 */






