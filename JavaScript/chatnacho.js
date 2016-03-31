/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// THINGS WE NEED TO DO NOW:
// THERE IS A QUESTION THAT WAS NEVER TAKEN INTO ACCOUNT HERE: WITH THE RANDOM NUMBER FOR THE GUEST USERS, WE COULD
// HAVE SOME OF THEM REPEATED THERE. SO WE WILL NEED TO MAKE SURE THAT THERE IS NO RANDOM USER THAT HAS ALREADY BEEN
// ASIGNED BEFORE WITHIN THE LAST 50 MESSAGES. ACTUALLY, THE BEST THING WOULD BE TO ASSIGN GESTS IN ORDER WITH A PERSISTENT
// VARIABLE THAT WE CAN JUST HAVE IN THE DATABASE OR IN A FILE. ACTUALLY DATABASE DOES NOT FIT A SINGLE VARIABLE...
// ALSO LETS HAVE IN ACCOUNT THAT EVERY TIME WE MAKE A NEW GUEST WE WILL WANT TO UPDATE IMMEDIATELY THAT FILE.
// OK LETS SEE, MAYBE JSON CAN HELP US A LOT HERE OR MAYBE NOT... BUT ITS WORTH TO TRY.

// SO WE WILL TRY TO USE JSON WITH A FILE OR STH IN ORDER TO HAVE AN ORDER WITH THE GUESTS. WE JUST WANT A PERSISTENT
// VARIABLE FOR THE LAST GUEST ASSIGNED.

// STH VERY INTERESTING WILL BE TO IMPLEMENT A FUNCTION TO LOAD OLDER MESSAGES WHEN SCROLLING UP MORE THAN THE CURRENT SHOWN
// MESSAGES.

// BECAUSE, IMAGINE WE LOSE THE DATA CONNECTION OR STH... THEN WE NEED TO COUNT THE MESSAGES
// AND ALSO TO LOOK FOR THE LAST GUEST NUMBER. FORTUNATELLY, I CAN TELL FROM NOW THAT THE LAST GUEST WILL BE ONE OF WITHIN
// THE MESSAGES POSTED THE LAST DAY.
// OK SO WHO CARES ABOUT STORING THE LAST GUEST NUMBER, IT DOESNT MAKE SENSE...
// COUNTING THE MESSAGES SHOULD NOT BE THAT TOUGH JOB.
// LETS DO BOTH OF THESE THINGS WHEN A NEW GUEST CONNECTS.
// SO, IN "WELCOMEUSER" WHEN THE USER IS NOT REGISTERED.
// (BECAUSE THAT ONE FUNCTION IS NOT SO OFTEN RUN :P)
// SO NO JSON NO SHITTY VARIABLES AT THE MOMENT HAHA

// NOW WE HAVE FORGOT PASSWORD SUPPOSEDLY WORKING.
// BETTER WE WILL REDIRECT TO THE INDEX WITHOUT PARAMETERS AFTER CHANGING THE PASSWORD.
// AND WHEN THE PERSON REGISTERS, WE ALSO NEED TO SEND A CONFIRMATION EMAIL.
// WE WILL JUST STORE IN SESSION THE REST OF THE DATA, IN A DIFFERENT VARIABLE ONLY FOR THIS CASE.
// THEN THE PERSON CLICKS THE LINK AND GOES TO THE INDEX?REG.
// THEN WE CAN DO THE REGISTERING IN THE DATABASE, BUT NOT BEFORE.

$('document').ready(function() {
    var $mainFrame = $('#mainFrame');
    var tasks = [];
    var updateInterval = 3000;
    //var fieldExecuting = false;
    var tries = 0; // counter for tries when posting a message
    var xhr;
    var logged = false;
    //var managerRunning = false;
    var debugMode = true;
    var $chatWindow, $userChat;
    var userid = 0, lastid = 0, username = "";
    var xhr = new XMLHttpRequest();
    var manageQueue = false;
    var currentQtask;
    var $changeUserBtn;
    //var enableManager = true;
    
    var $chatDiv, $welcome,$loginLink,$regLink,$logoutLink;
    var $input;
    var $sendBtn,$msgbox;
    var tempUser = "";
    var minlength = 6;
    // check if the user is logged or not
    var loc = document.getElementById('loc');
    var loctext = loc.innerHTML;
    alert(loctext);
    if(loctext === "changepass") {
        loadChangePass();
    }
    else {
        loadChat();
    }
    
    function init() {
        lastid = 0;
    }
    //=====================================================================================
    //                        CHANGE PASSWORD PAGE
    //=====================================================================================
    
    function loadChangePass() {
        $mainFrame.html("");
        
        $mainFrame.load("changepassword.html", function() {
            //var changePassDiv = document.getElementById("changePassDiv");
            var flags = {pass : false, confpass : false};
            var $passIn = $mainFrame.find("#passChan");
            var $confPassIn = $mainFrame.find("#confirmPassChan");
            var $testPassIn = $mainFrame.find("#testPassChan");
            var $testConfPassIn = $mainFrame.find("#testConfirmPassChan");
            
            checkPass($passIn, $testPassIn, minlength, flags, "pass");
            confirmPassword($confPassIn, $passIn, $testConfPassIn, flags, "confpass");
            //confirmPassword($confirmPass, $passReg, $testConfirmPass, flags, "confpas");
            var goPassChan = document.getElementById("goPassChan");
            goPassChan.addEventListener("click", sendChangePass);
        
        
            function sendChangePass() {
                alert("www");    
                if(!flags['pass']) {
                        alert("Bad password");
                        return;
                    }
                if(!flags['confpass']) {
                    alert("Pasword does not match");
                    return;
                }
                alert("no errror");
                var passChanPost = "task=changePass&newPass=" + encodeURIComponent(sha1($passIn.val()));
                alert(passChanPost);
                //tasks = [];
                var changePassTask = new QueueTask(passChanPost, afterResponseChangePass, "login.php");
                executeTask(changePassTask);
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
            
            function afterResponseChangePass(docresponse) {
                // we can go to login page or log in and enter chat directly.
                var passChanged = docresponse.getElementsByTagName("passchanged")[0].firstChild.data.toString();
                alert("passChanged: " + passChanged);
                if(passChanged === "false") {
                    alert("Sorry, there was a problem when setting the new password. Please retry it later.");
                    return;
                }
                alert("Your password was successfully changed! Now you will be logged in.");
                loguser(docresponse);
            }
            
        });
    }
    
    
    
//==========================================================================================
//                             WITHIN THE CHAT PAGE
//=====================================================================================
    
    /**
     * Loads the chat page from its file
     * @returns {undefined}
     */
    function loadChat() {
        // WE SHOULD TRY TO MAKE EACH PAGE AN INDIVIDUAL BLOCK WITH ITS OWN JAVASCRIPT AND THEN IT WILL BE LOADED.
        // BUT WE COULD NEED ACCESS TO SOME GLOBAL VARIABLES. NOT SURE, SINCE WE CAN USE ADDEVENTLISTENER AND
        // JUST PASS A LISTENER FUNCTION OR HANDLER WITH SOME MORE VARIABLES.
        // IT SHOULDNT BE THAT BAD. THE REAL PROBLEM COULD BE I DID STH TOO COMPLEX FOR NOTHING...
        init();
        $mainFrame.html("");
        $mainFrame.load("chat.html", function() {
            tasks = [];
            $chatDiv = $mainFrame.find('#chatDiv');
            $welcome = $chatDiv.find('#welcome');
            $loginLink = $chatDiv.find('#loginLink');
            $regLink = $chatDiv.find('#regLink');
            $logoutLink = $chatDiv.find('#logoutLink');
            $chatWindow = $('#chatWindow');

            //$chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input');
            $userChat = $input.find('#userChat');
            $changeUserBtn = $input.find('#changeUser');
            var $chgtxt = $input.find('#chgtxt'),
            $forgPass = $chatDiv.find('#forgPass');
            $sendBtn = $input.find('#sendBtn');
            $msgbox = $input.find('#msgbox');
            $loginLink.on('click', loadLogin);
            $regLink.on('click', loadReg);
            $logoutLink.on('click', orderLogout);
            $forgPass.click(loadForgotPass);
            checkLogin();
            
            $changeUserBtn.on('click', change);
            /*$userChat.blur(function() {
                $changeUserBtn.removeAttr('disabled');
            });*/
            function change() {
                if(tempUser !== "") {
                    $userChat.attr('disabled', 'disabled');
                    $msgbox.removeAttr('disabled');
                    tempUser = "";
                    $chgtxt.html("");
                    $changeUserBtn.html("Change"); 
                    //manageQueue = false;
                }
                else {
                    //manageQueue = false;
                    //tasks = [];
                    $msgbox.attr('disabled', 'disabled');
                    $changeUserBtn.attr('disabled', 'disabled');
                    $userChat.removeAttr('disabled');
                    tempUser = $userChat.val();
                    $chgtxt.html("Write new username and press enter");
                    $userChat.select();
                    $changeUserBtn.html("Confirm");
                    //changeGuestName();
                }
                
            }
            
            checkUser($userChat, "user", $chgtxt, "^[*a-zA-Z0-9ñÑ#\-\.\+\^<>]+$", 4,
                "<b>That user is already registered. Please login or pick another user name.</b>", 
                "Click on 'confirm' to set the new user name", false);
            
            function changeGuestName() {
                // here we are going to query to the database if the new username is already in database.
                // For that first we check if it meets the conditions for an username, and will query to the database
                // just in case it meets those conditions.
                //sth like "that user is already registered, please log in to use the chat or choose a different guest name".
                //var res = false;
                //0-9ñÑ_-\*#
                
            }
            
            /*checkField($userChat, "user", flags, "us", $chg, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "That user is already registered. Please login or pick another user name.", "Valid user name", true);
            
            /**
            * Generalized function for checking if the new guest user name entered is correct, available, etc
            * @param {JQuery <input> element} $input text input where we write the new user name
            * @param {String} field name of the field to check in the database
            * @param {JQuery <span> element} $output element which shows the advice text like "not valid", "too short", etc
            * @param {String} regex regular expression constraining the new name to input
            * @param {Integer} minlength Minimum lenght for the new name to input
            * @param {String} msgMatch Text to show if the field is in the database
            * @param {String} msgNoMatch Text to show if the field is not in the database
            * @param {Boolean} op Extra parameter for the php request, never change in this function.
            * @returns {undefined}
            */
           function checkUser($input, field, $output, regex, minlength, msgMatch, msgNoMatch) {
               $input.on("change", function() {
                   var res = false;
                   //alert(op);
                   var value = this.value;
                   //alert(this.value);
                   
                   if(!match(value, regex, minlength, $output)) {
                       //alert("regex error");
                       //$input.html("mierda");
                       //$output.html("This is not a valid " + field);
                       return false;
                   }
                   
                   if(!value.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/g)) {
                       $output.html(msgNoMatch);
                       $changeUserBtn.removeAttr('disabled');
                       return true;
                   }
                   fieldIsInDatabase(trim(value), field, function(res) {
                       if(res === "true") {
                           alert("hello");
                           $output.html(msgMatch);
                           //$changeUserBtn.attr('disabled', 'disabled');
                           //flags[flag] = !vf;
                           //alert("is in");
                           return false;
                       }
                       else {
                           $output.html(msgNoMatch);
                           //if (xhr.readyState === 4) {
                            $changeUserBtn.removeAttr('disabled');
                           //}
                               //flags[flag] = vf;
                           //alert("is not");
                           return true;
                       }
                   });
               });
           }
            
            
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
                //tasks = [];
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
                    if(tries < 3) {
                        alert("Sorry, there was an error when trying to post your message. Retrying...");
                        // This is very bad. We cannot put the task again in the queue to repeat, 
                        // because in that case, it will be executed again too late.
                        // So we need it to repeat but without putting this task in the queue again.
                        // Actually, this could be a bad idea, we can do it but we will need a limit of repeats...
                        // So, we can just execute the task without queue or put it in the head of the queue.
                        tries ++;
                        setTimeout(function() {
                            executeTask(currentQtask);
                        }, updateInterval);
                    }
                    else {
                        alert("Sorry, there was an error and was impossible to post your message.");
                        tries = 0;
                        setTimeout(executeTask, updateInterval); // restart the cycle
                    }
                }
                //$chatWindow.html(extractMessages(docresponse));
                extractMessages(docresponse);
            }
               
        }); 
    }
    
    function randomGuest() {
        $userChat.val("Guest" + Math.floor(Math.random() * 1000));
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
                alert("succesful logout");
                //lastid = idres;  
            }
            else {
                alert("Sorry, there was an error while logging out.");
            }
            loadChat();
            //$chatWindow.html(extractMessages(docresponse)); // this can be append if we mantain the page hidden...
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
        //stopManager(); // we are not in the chat window anymore so there's no need to do cyclic retrieves of messages.
        manageQueue = false;
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
            $forgotPass.click(loadForgotPass);
            
            var flags = {
                us : false,
                pas : false
            };
            
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
                "pass="  + encodeURIComponent(sha1($passLogin.val()));
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
    
    function loadForgotPass() {
        alert("load forgot");
        //stopManager(); // we are not in the chat window anymore so there's no need to do cyclic retrieves of messages.
        manageQueue = false;
        //cycleManager = false;
        $mainFrame.html("");
        //var correct = false;
        
        $mainFrame.load("forgotpassword.html", function() {
            var $forgotDiv = $mainFrame.find('#forgotDiv'),
            $forgotAddress = $forgotDiv.find('#address'),
            $testForgEmail = $forgotDiv.find('#testForgEmail'),
            $noticeEmSent = $forgotDiv.find('#noticeEmSent'),
            $goForgot = $forgotDiv.find('#goForgot');
            $goForgot.attr('disabled', 'disabled');
            
            var flags = {
                em : false
            };
            
            checkField($forgotAddress, "email", flags, "em", $testForgEmail, "^[a-z0-9\.\-_]+@[a-z]+\\.[a-z]{2,3}$", minlength,
            "Valid email address", "That email address is not registered. Try to remember your email or register a new one.", 
            false, disableGoForgot, enableGoForgot);
            function enableGoForgot() {
                $goForgot.removeAttr('disabled');
            }
            function disableGoForgot() {
                $goForgot.attr('disabled', 'disabled');
            }
            
            $goForgot.on('click', sendForgot);
            
            /**
             * Function triggered when clicking on "go" button. Performs checks and the login if everything is ok.
             * @returns {undefined}
             */
            function sendForgot() {
                alert("send forgot");
                if(!flags['em']) {
                    alert("Bad email");
                    return;
                }
                
                var forgotPost = "task=forgotpass&email=" + encodeURIComponent(trim($forgotAddress.val()));
                //tasks = [];
                var forgotTask = new QueueTask(forgotPost, afterResponseForgot, "login.php");
                executeTask(forgotTask);
                
                
                // So, now php receives the data and sends an email to the provided address, with a link to reset the password.
                // This can be embedded in the main page index for further use. So  we need to access index.html
                // and directly load the page changePassword, this is, directly invoke loadChangePassword function.
                // So we need to tell apart if we come from the email in order to load the page for password change.
                // Actually in this case a simple html would be much easier. Also I can see I have a little problem now
                // with the web addresses. Like there is no direct access to the pages like login, etc.
                // I will deal with that later. Just now I will make it work fully as a chat.
                

            }
            
            function afterResponseForgot(docresponse) {
                //loguser(docresponse); 
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
        //stopManager(); // same as in login
        manageQueue = false;
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
            //$userReg.val("aligatoR25");
            //$emailReg.val("aligator25@cona.com");
            //$passReg.val("22TTjfd");
            //$confirmPass.val("22TTjfd");
            $goReg.on('click', sendReg);
            
            
            checkField($userReg, "user", flags, "us", $testUserReg, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "That user is already registered. Please login or pick another user name.", "Valid user name", true);
            checkField($emailReg, "email", flags, "em", $testEmail, "^[a-z0-9\-\._]+@[a-z]+\\.[a-z]{2,3}$", minlength,
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
            
            
            
            confirmPassword($confirmPass, $passReg, $testConfirmPass, flags, "confpas");
            /*$confirmPass.on("input", function() {
                var val = this.value;
                if((typeof val) === "undefined" || val === "" || val !== $passReg.val()) {
                    $testConfirmPass.html("Password does not match");
                    flags.confpas = false;
                }
                else {
                    $testConfirmPass.html("Password confirmed");
                    flags.confpas = true;
                }
            });*/

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
                "pass=" + encodeURIComponent(sha1($passReg.val()))];
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
        
        // THIS EXECUTE TASK IS TOO GENERAL, FOR REGISTER AND LOGIN WE SHOULDNT NEED ANY QUEUE.
        // BUT ITS TRUE THAT WHEN LEAVING THE CHAT PAGE TO GO TO LOGIN WE MUST EMPTY THE QUEUE, WONT BE USED AT THE MOMENT.
        // ITS OK, ITS NOT IN THE QUEUE
        executeTask(new QueueTask("task=checklogin", function(docresponse) { // ALSO MUST MAKE ANOTHER SEPARATED QUEUE FOR LOGIN AND REGISTER THINGS, ETC.
            userid = docresponse.getElementsByTagName("user_id")[0].firstChild.data;
            alert("checking login: userid: " + userid);

            if(userid > 0) {
                username = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
                //alert("username: " + username);
                
                $userChat.val(username);
                //
                logged = true;
            }
            //alert("logged: " + logged);
            
            welcomeUser();
            manageQueue = true;
            executeTask();
            //after we know if the user is logged or not we put the suitable greeting, also we can make the random user
            //or disable the user textbox with the name of the user not possible to change.

        }, "login.php"));
    }
    
    function welcomeUser() {
        // PROBLEM: THIS SHOULD BE CALLBACK AFTER CHECKING THE LOGIN.
        // SOLVED.
        var $logreg = $chatDiv.find('#logreg');
        if(logged) { // if the user is logged (has performed login or register)
            $welcome.html("Welcome back, <b>" + username + "</b>");
            console.log("done username");
            $logreg.addClass('hidden');
            //$loginLink.addClass('hidden');
            //$regLink.addClass('hidden');
            $logoutLink.removeClass('hidden');
            $changeUserBtn.hide();
        }
        else {
            $welcome.html("Welcome, guest!");
            console.log("done guest");
            $logoutLink.addClass('hidden');
            //$loginLink.removeClass('hidden');
            //$regLink.removeClass('hidden');
            $logreg.removeClass('hidden');
            randomGuest();
            /*$msgbox.on("focus", function() {
                var val = $userChat.val();
                if(typeof val === "undefined" || val === "") {
                    randomGuest();
                } 
            });*/
             $changeUserBtn.show();
        }

        //orderRetrieveMessages(); // within the chat page we have to get the messages from the db of course
        //startManager(); // we start the cycle of the task manager
        //manageTasks();
    }
    
    /**
     * Function 
     * @param {type} docresponse
     * @returns {undefined}
     */
    function loguser(docresponse) {
        var idres = docresponse.getElementsByTagName("userid")[0].firstChild.data;
        var name = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
        alert("id: " + idres +"; name: " + name);
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
        //tasks.push(new QueueTask("task=&id=" + lastid, afterResponseRetrieveMessages));
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
    /*function manageTasks() {
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
    }*/
    
    /**
     * General function, it executes the tasks being used from a higher layer of functions.
     * @param {type} task
     * @param {type} handler
     * @param {type} callback
     * @returns {undefined}
     */
    function executeTask(qtask) {
        //xhr = new XMLHttpRequest();
        var queue = false;
        if(xhr)
        {
            try
            {
                // don't start another server operation if such an operation
                // is already in progress
                if (xhr.readyState === 4 || xhr.readyState === 0)
                {
                     
                    if(typeof qtask === "undefined") { // we dont put parameters and that means take next task from queue
                        queue = true;
                        if(tasks.length > 0) { // we have tasks in queue
                            qtask = tasks.shift();
                        }
                        else { // we dont have so just retrieve messages
                            qtask = new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages, "chatnacho.php");
                        }
                    }
                    currentQtask = qtask;
                    xhr.open("POST", qtask.file, true);
                    xhr.setRequestHeader("Content-Type",
                    "application/x-www-form-urlencoded");
                    xhr.onreadystatechange = function() {
                        handleServerResponse(qtask.callback, qtask.task, queue);
                    }       
                    xhr.send(qtask.task);
                }
                else
                {
                    // we will try again waiting for the state of the browser to be the correct one.
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
    function handleServerResponse(callback, task, queue) {
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
                    // run the cycle again
                    if(queue && manageQueue) {
                         setTimeout(executeTask, updateInterval);
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
            //var res = [];
            for(var i = 0, l = nameArray.length; i < l; i ++) {
                var name = nameArray[i].firstChild.data.toString(),
                time = timeArray[i].firstChild.data.toString(),
                message = messageArray[i].firstChild.data.toString();
                displayMessage('<div>[' + time + '] ' + name + ' said: <br/>' + 
                message + '</div>');
                //res.push('<div>[' + time + '] ' + name + ' said: <br/>' + 
                //message + '</div>');
            }
            lastid = idArray[idArray.length - 1].firstChild.data;
            //alert(lastid);
            //txtres = res.join("");
        }
        //setTimeout(orderRetrieveMessages, updateInterval);
        /*if(cycleManager) {
            tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages, "chatnacho.php"));
        }*/
        //return txtres;
        //setTimeout("requestNewMessages();", updateInterval);
    }
    
    /**
            * Just puts a single message on the chat window. Also, if the window is full, it scrolls!
            * @param {type} message
            * @returns {undefined}
            */
           function displayMessage(message)
           {
               // get the scroll object
               //var oScroll = document.getElementById("scroll");
               // check if the scroll is down
               var cw = $chatWindow[0];
               var scrollDown = (cw.scrollHeight - cw.scrollTop <= cw.offsetHeight);
               // display the message
               $chatWindow.append(message);
               cw.scrollTop = scrollDown ? cw.scrollHeight :
               cw.scrollTop;
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
        var patt = new RegExp(b, "ig");
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
    function checkField($input, field, flags, flag, $output, regex, minlength, msgMatch, msgNoMatch, vf, op, f1, f2) {
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
                    if(f1) {f1();}
                    //alert("is in");
                }
                else {
                    $output.html(msgNoMatch);
                    flags[flag] = vf;
                    if(f2) {f2();}
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
   
   /**
             * CHECK PASSWORD CONFIRMATION
             */
            function confirmPassword($conf, $orig, $output, flags, flag) {
                
                $conf.on("input", function() {
                    //alert("ey");
                    var val = this.value;
                    //alert("values pass: " + $orig.val() + "<br>" + val);
                    if((typeof val) === "undefined" || val === "" || val !== $orig.val()) {
                        $output.html("Password does not match");
                        flags[flag] = false;
                    }
                    else {
                        $output.html("Password confirmed");
                        flags[flag] = true;
                    }
                });   
            }
    
});

/*
 * Everything here was a tremendous bad thing and now we try to fix it bit by bit.
 * I put a separate file for all user login purposes, called login.php, calling login.class.php.
 */






