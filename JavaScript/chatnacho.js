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
    else if(loctext === "register") {
        finishRegister();
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
                //alert("www");    
                if(!flags['pass']) {
                        alert("Bad password");
                        return;
                    }
                if(!flags['confpass']) {
                    alert("Pasword does not match");
                    return;
                }
                //alert("no errror");
                var passChanPost = "task=changePass&newPass=" + encodeURIComponent(sha1($passIn.val()));
                //alert(passChanPost);
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
                //alert("passChanged: " + passChanged);
                if(passChanged === "false") {
                    alert("Sorry, there was a problem when setting the new password. Please retry it later.");
                    //return;
                }
                else {
                    alert("Your password was successfully changed! Now you will be logged in.");
                }
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
    //var selecInBox = "";
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
            //$msgbox = $input.find('#msgbox');
//            var $formatButtons = $chatDiv.find('.chatToolbar').find('td');
//            $formatButtons.filter(':eq(0)').on('click', function() {
//                addFormat("b");
//            });
//            
//            $formatButtons.filter(':eq(1)').on('click', function() {
//                addFormat("i");
//            });
//            
//            $formatButtons.filter(':eq(0)').on('click', function() {
//                addFormat("u");
//            });
            
            
            $loginLink.on('click', loadLogin);
            $regLink.on('click', loadReg);
            $logoutLink.on('click', orderLogout);
            $forgPass.click(loadForgotPass);
            checkLogin();
            
            $changeUserBtn.on('click', change);
            /*$userChat.blur(function() {
                $changeUserBtn.removeAttr('disabled');
            });*/
             
            
//            var startSelec = -1;
//            var endSelec = -1;
//            $msgbox.on("mouseup", getTheRange);
            //$msgbox.select(getTheRange);
            
            function getTheRange() {
                var range = "";
                if (window.getSelection) {
                    range = window.getSelection().getRangeAt(0);
                } 
                else if (document.selection && document.selection.type != "Control") {
                    range = document.selection.createRange();
                }
                startSelec = range.startOffset;
                endSelec = range.endOffset;
            }
            var $msgbox1 = $input.find('#msgbox1');
//            function addFormat(tag) {
//                if(startSelec === -1 || startSelec === endSelec) {
//                    alert("Please select some text first to apply the changes.");
//                    startSelec = -1;
//                    endSelec = -1;
//                    return;
//                }
//                var text = $msgbox.html();
//                var newText = text.substring(0, startSelec) + "<"+tag+">" + text.substring(startSelec, endSelec) + "</"+tag+">" + text.substring(endSelec);
//                $msgbox.html(newText);
//                startSelec = -1;
//                endSelec = -1;
//            }
            
            function change() {
                if(tempUser !== "") { 
                    $userChat.attr('disabled', 'disabled');
                    $msgbox1.removeAttr('disabled');
                    tempUser = "";
                    $chgtxt.html("");
                    $changeUserBtn.html("Change"); 
                    //manageQueue = false;
                }
                else {
                    //manageQueue = false;
                    //tasks = [];
                    $msgbox1.attr('disabled', 'disabled');
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
                           //alert("hello");
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
                var message = trim($msgbox1.val());
                if(typeof message === 'undefined' || message === "") {
                    alert("sending empty messages is not allowed");
                    return;
                }
                //alert("send message");
                
                var msgPost = "task=sendMessage" + "&user=" + encodeURIComponent(trim($userChat.val())) + 
                "&message=" + encodeURIComponent(message) + "&id=" + lastid;
                //tasks = [];
                tasks.push(new QueueTask(msgPost, afterResponseSendMessage, "chatnacho.php"));
                //alert(msgPost);
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
                //alert("sending message");
                var posted = docresponse.getElementsByTagName("posted")[0].firstChild.data.toString();
                //alert("posted: " + posted);
                if(posted === "true") {
                    //alert("post ok");
                    $msgbox1.val("");
                }
                else {
                    if(tries < 3) {
                        alert("Sorry, there was an error when trying to post your message. Retrying...");
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
    //=====================================================================================
    //                        END OF THE CHAT THINGS
    //=====================================================================================
    
    /**
     * Function that puts a random user name for a guest in the user name text box. We have to change this function,
     * since we cannot have duplicate guests. So we will cycle the numbers.
     * @returns {undefined}
     */
    function randomGuest() {
        $userChat.val("Guest" + Math.floor(Math.random() * 1000));
    }
    
    /**
     * Perfoms the logout. I dedided to put this function outside of the chat thing to avoid a recursive call or  the things
     * about the closure...
     * @returns {undefined}
     */
    function orderLogout() { // I decided to put this function outside of
        //alert("logout"); 
        executeTask(new QueueTask("task=logout", function(docresponse) {
            var logoutres = docresponse.getElementsByTagName("logout")[0].firstChild.data.toString();
            if(logoutres === "true") {
                logged = false;
                userid = 0;
                username = "";
                //alert("succesful logout"); 
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
    
    function finishRegister() {
        alert("finish register");
        //stopManager(); // we are not in the chat window anymore so there's no need to do cyclic retrieves of messages.
        manageQueue = false;
        //cycleManager = false;
        $mainFrame.html("");
        //var correct = false;
        executeTask(new QueueTask("task=finishregister", afterResponseFinishRegister, "login.php"));
    }
    
    function afterResponseFinishRegister(docresponse) {
        registerUser(docresponse);
    }
    
    function registerUser(docresponse) {
        var regis = docresponse.getElementsByTagName("registered")[0].firstChild.data;
        if(regis !== "true") {
            alert("Sorry, an unexpected error occurred and you could not be registered.")
        }
        else {
            var idres = docresponse.getElementsByTagName("userid")[0].firstChild.data;
            var name = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
            //alert("id: " + idres +"; name: " + name);
            if(idres > 0) {
                logged = true;
                userid = idres;  
                username = name;
            }

            else {
                alert("Sorry, you were correctly registered, but there was an error while logging. Please try logging in from the chat");
            }
        }
        window.location = "http://chatnacho.tk/index.php";
        //loadChat();
    }
 
    //==========================================================================================
//                             WITHIN THE LOGIN PAGE
//=====================================================================================
    /**
     * Loads the login page from its file
     * @returns {undefined}
     */
    function loadLogin() {
        //alert("load login");
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

            checkField($userLogin, "user", flags, "us", $testUserLogin, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "Valid user", "That user is not in database", false, "login");
            
            checkPass($passLogin, $testPas, minlength, flags, "pas");
            
            $goLogin.on('click', sendLogin);
            
            /**
             * Function triggered when clicking on "go" button. Performs checks and the login if everything is ok.
             * @returns {undefined}
             */
            function sendLogin() {
                //alert("send login");
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
                var loginTask = new QueueTask(loginPost, afterResponseLogin, "login.php");
                executeTask(loginTask);
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
//                             THINGS IN FORGOT PASS PAGE
//=====================================================================================
    
    function loadForgotPass() {
        //alert("load forgot");
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
                //alert("send forgot");
                if(!flags['em']) {
                    alert("Bad email");
                    return;
                }
                
                var forgotPost = "task=forgotpass&email=" + encodeURIComponent(trim($forgotAddress.val()));
                //tasks = [];
                var forgotTask = new QueueTask(forgotPost, afterResponseForgot, "login.php");
                executeTask(forgotTask);
                $mainFrame.html("<h2>Please check your incoming mail, we just sent you a confirmation email.</h2>");
                
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
//                             END OF THE FORGOT PASS THINGS
//=====================================================================================
    
    
    
      
    //==========================================================================================
//                             WITHIN THE REGISTER PAGE
//=====================================================================================
    /**
     * Loads the register page from its file
     * @returns {undefined}
     */
    function loadReg() {
        //alert("load reg");
        manageQueue = false;
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
            $goReg.on('click', sendReg);
            
            
            checkField($userReg, "user", flags, "us", $testUserReg, "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])", minlength,
            "That user is already registered. Please login or pick another user name.", "Valid user name", true);
            checkField($emailReg, "email", flags, "em", $testEmail, "^[a-z0-9\-\._]+@[a-z]+\\.[a-z]{2,3}$", minlength,
            "That email address is already registered. Please login or write a different email.", "Valid email address", true);
 
            /**
             * CHECK THE PASSWORD
             */
            
            checkPass($passReg, $testPass, minlength, flags, "pas");
   
            confirmPassword($confirmPass, $passReg, $testConfirmPass, flags, "confpas");

            /**
             * Function triggered when clicking on the "go" button. Performs checks and the register if everything is ok.
             * @returns {undefined}
             */
            function sendReg() {
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
                //alert("no errror");
                var regt = ["task=register", "user=" + encodeURIComponent($userReg.val()), 
                "email=" + encodeURIComponent($emailReg.val()),
                "pass=" + encodeURIComponent(sha1($passReg.val()))];
                var regPost = regt.join("&");
                //alert(regPost);
                var regTask = new QueueTask(regPost, afterResponseRegister, "login.php");
                executeTask(regTask);
                $mainFrame.html("<h2>Please check your incoming mail, we just sent you a confirmation email.</h2>");

            }
            
            function afterResponseRegister(docresponse) {
                //$mainFrame  
            }
        });
    }
    
    //==========================================================================================
//                             END OF THE REGISTER THINGS
//=====================================================================================
 
    /**
     * simply check if we are logged or not.
     * @returns {undefined}
     */
    function checkLogin() {
        
        // THIS EXECUTE TASK IS TOO GENERAL, FOR REGISTER AND LOGIN WE SHOULDNT NEED ANY QUEUE.
        // BUT ITS TRUE THAT WHEN LEAVING THE CHAT PAGE TO GO TO LOGIN WE MUST EMPTY THE QUEUE, WONT BE USED AT THE MOMENT.
        // ITS OK, ITS NOT IN THE QUEUE
        executeTask(new QueueTask("task=checklogin", function(docresponse) {
            userid = docresponse.getElementsByTagName("user_id")[0].firstChild.data;
            //alert("checking login: userid: " + userid);

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
    
    /**
     * Writes the welcome message for the user or guest in each case.
     * Also if it is a guest, it calls randomGuest.
     * IMPORTANT: This function is a callback called at the end of checklogin.
     * @returns {undefined}
     */
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

             $changeUserBtn.show();
        }

    }
    
    /**
     * Logs in the user. Callback called after response when login and registering and so on.
     * @param {xmlDoc} docresponse
     * @returns {undefined}
     */
    function loguser(docresponse) {
        var idres = docresponse.getElementsByTagName("userid")[0].firstChild.data;
        var name = docresponse.getElementsByTagName("username")[0].firstChild.data.toString();
        //alert("id: " + idres +"; name: " + name);
        if(idres > 0) {
            logged = true;
            userid = idres;  
            username = name;
            
        }
        else {
            alert("Sorry, there was an error while logging. Check if your user and password are correct.");
        }
        if(docresponse.getElementsByTagName("passchanged").length != 0) {
            window.location = "http://chatnacho.tk/index.php";
        }
        //
        loadChat();
        //$chatWindow.html(extractMessages(docresponse)); // this can be append if we mantain the page hidden...
        //tasks.push(new QueueTask("task=&id=" + lastid, afterResponseRetrieveMessages));
    }
    
    /**
     * It creates a new task for retrieving messages and adds it at the end of the task queue.
     * @returns {undefined}
     */
    function orderRetrieveMessages() {
        //alert("retrieve"); 
        tasks.push(new QueueTask("task=retrieve&id=" + lastid, afterResponseRetrieveMessages, "chatnacho.php"));
    }
    
    /**
     * Callback after response from executing the task added in the previous function.
     * @param {xmlDoc} docresponse
     * @returns {undefined}
     */
    function afterResponseRetrieveMessages(docresponse) {
        var contentToAppend = extractMessages(docresponse);
        $chatWindow.append(contentToAppend);
    }
     
    /**
     * General function, it executes the tasks being used from a higher layer of functions.
     * @param {QueueTask} qtask
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
     * 
     * @param {Function} callback The instructions to perform with the response obtained.
     * @param {String} task The task sent to the php document. Not needed, just for tracking purposes. 
     * @param {boolean} queue True if we are taking tasks from the queue
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
    
    /**
     * Obtains all the messages from the xml response and appends them to the chat window.
     * @param {xmlDoc} docresponse
     * @returns {undefined}
     */
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
    * @param {html code} message
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
     * Class and constructor. A task with the associated callback to perform after response from server.
     * @param {String} task Parameters to pass to php file
     * @param {Function} callback Function to call after response from the server when execute this task.
     * @param {type} file php file to which this task must be sent.
     * @returns {chatnacho_L22.QueueTask}
     */
    function QueueTask(task, callback, file) {
        this.task = task;
        this.callback = callback;
        this.file = file;
    }
    
    /**
     * Tests a text from some input against a min length and a regexp.
     * @param {String} a Text from the input to check
     * @param {String regexp} b Regular expression the input should match
     * @param {int} minlength Min. length of the input to be acceptable 
     * @param {JQuery element} $output Element where we write the result of evaluating the regexp
     * @returns {Boolean}
     */
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
     * 
     * @param {JQuery input element} $input The input containing the text we are checking.
     * @param {String} field Name of the database field we want to check against.
     * @param {Object} flags An object containing various boolean flags. Will contain the result of this function.
     * @param {String} flag Field inside flags we change to true or false depending on the result.
     * @param {JQuery element} $output Element in which we write the result of the function.
     * @param {String} regex Regular expresion the content of the input should match 
     * @param {int} minlength Min length the text in the input must have.
     * @param {String or html} msgMatch Message to show in the output when the input matches and its in the database.
     * @param {String or html} msgNoMatch Message to show in case of no match.
     * @param {boolean} vf Inverts the matching/no matching results true/false given to the flag.
     * @param {type} op This can be "login" and in that case it will pass a different parameter to the php file to accept the same username or email.
     * @param {type} f1 Callback to execute if the value for the given field is already in database.
     * @param {type} f2 Callback to execute if the value for the given field is not in database.
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
                    //("hello");
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
    
    
    /**
     * checks if a certain value for a field is in the database.
     * @param {type} value Value for the field
     * @param {type} field Name of the field or column in database
     * @param {type} callback Function to execute after server response.
     * @param {type} op Optional parameter, if it is login the php function accepts both username or email.
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
     * Its ok to use this function but could also use the general one.
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
                    // retrieve the flag that says if the chat window has been cleared or not
                    //alert(docresponse.getElementsByTagName("clear")[0].firstChild.data);
                    var res = docresponse.firstChild.data.toString();
                    //alert("response " + xhr.responseText);
                    //alert(callback);
                    callback(res);
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
   
    /**
     * Checks if the confirmed password matches the password in the previous text box.
     * @param {JQuery element} $conf Password confirmation text box
     * @param {JQuery element} $orig Password text box
     * @param {JQuery element} $output Element showing the result of the function or feedback
     * @param {Object} flags Object consisting of boolean flags
     * @param {String} flag Name of the flag within the flags object
     * @returns {undefined}
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
    
    /*function getCaretPosition(editableDiv) {
        var caretPos = 0,
          sel, range;
        if (window.getSelection) {
          sel = window.getSelection();
          if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            if (range.commonAncestorContainer.parentNode == editableDiv) {
              caretPos = range.endOffset;
            }
          }
        } else if (document.selection && document.selection.createRange) {
          range = document.selection.createRange();
          if (range.parentElement() == editableDiv) {
            var tempEl = document.createElement("span");
            editableDiv.insertBefore(tempEl, editableDiv.firstChild);
            var tempRange = range.duplicate();
            tempRange.moveToElementText(tempEl);
            tempRange.setEndPoint("EndToEnd", range);
            caretPos = tempRange.text.length;
          }
        }
        return caretPos;
      }*/
    
});







