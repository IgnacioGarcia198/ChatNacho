/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$('document').ready(function() {
    var $mainFrame = $('#mainFrame');
    var $chatDiv = $mainFrame.find('#chatDiv');
    var $loginDiv = $mainFrame.find('#loginDiv');
    //loadChat();
    showChat();
    
    /*function loadChat() {
        $mainFrame.load("chat.html", function() {
            $chatWindow = $('#chatWindow');

            $chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input');
            $sendBtn = $input.find('#sendBtn');
            $msgbox = $input.find('#msgbox');
            $sendBtn.on('click', sendMessage);
        });
    }*/
    
    function showChat() {
        $chatDiv.show(500, function() {
            var loginLink = $chatDiv.find('#loginLink'),
            regLink = $chatDiv.find('#regLink');
            $chatWindow = $('#chatWindow');
            $chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input');
            $sendBtn = $input.find('#sendBtn');
            $msgbox = $input.find('#msgbox');
            $sendBtn.on('click', sendMessage);
        });
    }
    
    function showLogin() {
        $mainFrame.load("login.html", function() {
            $chatWindow = $('#login');

            $chatWindow.html("jdaaaaaaaaaoder");
            $input = $mainFrame.find('#input');
            $sendBtn = $input.find('#sendBtn');
            $msgbox = $input.find('#msgbox');
            $sendBtn.on('click', sendMessage);
        });
    }
    
});

function sendMessage() {
    alert("fuck man");
}




