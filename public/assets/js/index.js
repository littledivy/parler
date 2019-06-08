var socket = io.connect('/');

socket.on('connect', function (data) {
  console.log('Connected');
});

socket.on('msg', function (data) {
  console.log(data);
  renderChat(data);
});

socket.on('typing', function (data) {
  console.log(data);
  renderTyping(data);
});

socket.on('auth', function (data) {
  if(data.success) {
    window.username = data.username;
    $("#login-div").fadeOut();
    $("#chat-div").fadeIn();
    renderNotification(`${data.username} has joined the chat.`);
  };
});

function loginHandler(e) {
  if(e.keyCode == 13) {
    console.log('Trying to log in...');
    socket.emit("login", {
      username:e.target.value
    });
  }
};

function msgHandler(e) {
  if(e.keyCode == 13) {
    console.log('Sending your msg...');
    socket.emit("msg", {
      by:window.username,
      txt:e.target.value,
      time:new Date()
    });
  }
  else {
    socket.emit("typing", {
      who:window.username
    })
  }
}

function renderChat(data) {
  $("#chat-div").append(`<li class="list-group-item"> <strong>${data.by}</strong> : ${data.txt} <span style="float:right;">${data.time}</span></li>`);
}

function renderTyping(data) {
  $("#typing").html(`<div class="alert alert-danger">${data.who} is typing...</div>`);
  setTimeout(function() {
    $("#typing").html('');
  }, 2000)
}

function renderNotification(data) {
  $("#chat-div").append(`<li class="list-group-item"><center><i>${data}</i></center></li>`);
}

$("#username").on("keydown", loginHandler);
$("#msg_box").on("keydown", msgHandler);
