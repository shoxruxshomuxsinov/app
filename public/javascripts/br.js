var myGroups = [];
var onlineUsers = [];

var socket = new WebSocket("ws://192.168.7.186:3000/");

socket.onopen = function(){
  var group = "publicGroup";
  var msg = {"event":"connect", "gr":group};
  msg = JSON.stringify(msg);
  socket.send(msg);
  alert('Connect');

}

 socket.onclose = function(event) {
    var msg = {"event":"disconnect"};
    msg = JSON.stringify(msg);
    socket.send(msg);
  };

  $('#onlineUsersList').on('click', 'a', function () {
      var us = this.id
      var msg = {"event": "addToPrivateGroup", "who": us};
      msg = JSON.stringify(msg);
      socket.send(msg);
  });

  $('#groupList').on('click', 'a', function(){
      var groupId = this.id;
      var msg = {"event":"switchGroup", "gr": groupId};
      msg = JSON.stringify(msg);
      socket.send(msg);
  });

// отправить сообщение из формы
$(function () {
    $("#myInput").keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
          $("#myButton").trigger('click');
          return false;
        }
    });
    $('body').on('click', '#myButton', function(){
      var text = $('#myInput').val();
      var msg = {"mes": text, "event":"sendMsg"};
      msg = JSON.stringify(msg);
      socket.send(msg);
      $('#myInput').val('');
      return false;
    });
});

$('#myInput').keyup(function(){
  var value = $(this).val();
  if(value.length > 0){
    var msg = {"mes":value, "event":"typing"};
    msg = JSON.stringify(msg)
    socket.send(msg);
  } else{
      var msg = {"mes":value, "event":"clear"};
      msg = JSON.stringify(msg);
      socket.send(msg);
    }
});

// обработчик входящих сообщ
socket.onmessage = function(event) {

  var date = new Date();
  var incomingMessage = event.data;

  incomingMessage = JSON.parse(incomingMessage);

  if(incomingMessage.event == "typing"){
      $('span#' + incomingMessage.username).addClass('typing');

  } else if(incomingMessage.event == "clear"){
      $('span#' + incomingMessage.username).removeClass('typing');

  } else if(incomingMessage.event == "sendMsg"){
      showMessage(incomingMessage, date);

  } else if(incomingMessage.event == "connect"){

      showHistory(incomingMessage);
      connectToChat(incomingMessage);

  } else if(incomingMessage.event == "sendHistory"){
      showHistory(incomingMessage);

  } else if(incomingMessage['onlineUsers']){

    showOnlineUsers(incomingMessage['onlineUsers']);
    return;

  } else if(incomingMessage.event == "switchGroup"){
      switchGroup(incomingMessage);

  } else if(incomingMessage.event == "newGroup"){

      var found = checkGroup(incomingMessage, myGroups);
      if(found == false){
        addNewGroup(incomingMessage);
      }
  }
};


//показать онлайн пользователей
function showOnlineUsers(users){
    if(users){
      document.getElementById('onlineUsersList').innerHTML = '';
        for(var i=0; i < users.length; i++) {
            var onlineUser = document.createElement('div');
            var typingUser = document.createElement('span');
            var a = document.createElement('a');
            var list = document.createElement('li');
            a.setAttribute('href', '#');
            a.setAttribute('id', users[i]);
            a.setAttribute('class', users[i]);
            typingUser.appendChild(document.createTextNode(" typing..."));
            typingUser.setAttribute('id', users[i]);
            onlineUser.appendChild(document.createTextNode(users[i]));
            onlineUser.appendChild(typingUser);
            list.appendChild(onlineUser);
            a.appendChild(list);
            document.getElementById('onlineUsersList').appendChild(a);
        }
    }
}

// показать сообщение в div#message.gr
function showMessage(message, date){
  var group = $('#chatBoard').find('#' + message.gr);
    if(group){
      var messageElem = document.createElement('div');
      messageElem.appendChild(document.createTextNode(message.username + ": " + message.mes + " " + date.getHours() + ":" + date.getMinutes()));
      var chat = document.getElementById("chatBoard");
      document.getElementById(message.gr).appendChild(messageElem);
    }
    else {
      var chat = document.getElementById("chatBoard");
      var group = document.createElement("div");
      var messageElem = document.createElement('div');
      group.setAttribute("id", message.gr);
      chat.childNode[group].appendChild(messageElem);
    }
}

//показать ленту
function showHistory(message){
  if(message.mes){
    document.getElementById("chatBoard").innerHTML = "";
      var groupname = message.gr;
      var gr = document.createElement('div');
      gr.setAttribute('id', groupname);
      for(var i = 0; i < message.mes.length; i++){
        var messageElem = document.createElement('div');
        messageElem.appendChild(document.createTextNode(message.mes[i].username + ": " + message.mes[i].message + " " + message.mes[i].date));
        gr.appendChild(messageElem);
        document.getElementById("chatBoard").appendChild(gr);
    }
  }
}

//переключиться в другую группу
function switchGroup(message){
    document.getElementById('chatBoard').innerHTML = "";
    var group = document.createElement("div");
    group.setAttribute("id", message.gr);
    document.getElementById("chatBoard").appendChild(group);
}

//подключиться к чату
function connectToChat(message){
  var pubGroup = document.createElement('div');
  var list = document.createElement("li");
  var a = document.createElement('a');
  a.setAttribute('id', message.gr);
  pubGroup.setAttribute('id', message.gr);
  pubGroup.appendChild(document.createTextNode(message.gr));
  list.appendChild(pubGroup);
  a.appendChild(list);
  document.getElementById('groupList').appendChild(a);

  var gr = document.createElement('div');
  gr.setAttribute('id', message.gr);
  document.getElementById('chatBoard').appendChild(gr);
}

//проверка на существование группы
function checkGroup(message, group){
  var found = false;
  for(var i = 0; i < group.length; i++){
      if(message.gr == group[i]){
        found = true;
      }
  }
  return found;
}

//добавить новую группу
function addNewGroup(message){
  var newGroup = document.createElement('div');
  var list = document.createElement("li");
  var a = document.createElement('a');
  a.setAttribute('id', message.gr);
  newGroup.setAttribute('id', message.gr);
  newGroup.appendChild(document.createTextNode("Group of " + message.gr));
  list.appendChild(newGroup);
  a.appendChild(list);
  document.getElementById('groupList').appendChild(a);
  myGroups.push(message.gr);
}
