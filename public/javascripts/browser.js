    var onlineUsers = [];
    var date = new Date();
    var socket = new WebSocket("ws://192.168.7.186:3000/");


    socket.onopen = function(){
      socket.send("Open");
      alert('Connect');

    }
    // socket.onclose = function(){
    //   alert('Close');
    // }

      socket.onclose = function(event) {
        if (event.wasClean) {
          console.log('Соединение закрыто чисто');
        }
      };


    // отправить сообщение из формы publish
    document.forms.publish.onsubmit = function() {
      var outgoingMessage = this.message.value;
      socket.send(outgoingMessage);
      $('textarea').val('');
      return false;
    };

    $(function () {
        $("#myform").keypress(function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) {
                $("#submit").trigger('click');
                return false;
            }
        });
    });

    $('.message-area').keyup(function(){
      var value = $(this).val();

      if(value.length > 0){
        var message = "typing";
        socket.send(message);
      } else{
          var message = "clear";
          socket.send(message);
      }
    });
    // обработчик входящих сообщ
    socket.onmessage = function(event) {
      var incomingMessage = event.data;
      incomingMessage = JSON.parse(incomingMessage);

      if(incomingMessage['online-users']){
        showOnlineUsers(incomingMessage['online-users']);
        return;
      }

      if(incomingMessage.typing == "history"){
        showHistory(incomingMessage);
        $('#'+incomingMessage.username).removeClass('typing');
      } else if(incomingMessage.typing == true && incomingMessage.mes == "typing"){
          // showOnline(incomingMessage);
          $('#'+incomingMessage.username).addClass('typing');
      } else if(incomingMessage.typing == false && incomingMessage.mes == "clear"){
          // showOnline(incomingMessage);
          $('#'+incomingMessage.username).removeClass('typing');
      } else if(incomingMessage.isOnline == false){
          deleteUser(incomingMessage);
          // showOnline(incomingMessage);
      } else if(incomingMessage.isOnline == true){
        // showOnline(incomingMessage);
      } else {
        // showOnline(incomingMessage);
        showMessage(incomingMessage);
      }
    };
    function showOnlineUsers(users){

        document.getElementById('online').innerHTML = '';
          for(var i=0; i < users.length; i++) {
              var onlineUser = document.createElement('div');
              var typingUser = document.createElement('span');
              typingUser.appendChild(document.createTextNode("typing..."));
              typingUser.setAttribute('id', users[i]);
              onlineUser.appendChild(document.createTextNode(users[i]));
              onlineUser.setAttribute('class', users[i]);
              onlineUser.appendChild(typingUser);
              document.getElementById('online').appendChild(onlineUser);
          }

    }
    // показать сообщение в div#subscribe
    function showMessage(message) {
      var messageElem = document.createElement('div');
      messageElem.appendChild(document.createTextNode(message.username + ": " + message.mes + " " + date.getHours() + ":" + date.getMinutes()));
      document.getElementById('subscribe').appendChild(messageElem);
    }

    function showHistory(message){
      var messageElem = document.createElement('div');
      messageElem.appendChild(document.createTextNode(message.username + ": " + message.mes + " " + message.time));
      document.getElementById('subscribe').appendChild(messageElem);
    }

    function deleteUser(message){
      $('.' + message.username).remove();
      onlineUsers.splice(message.username, 1);
    }
