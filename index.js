const createError = require("http-errors");
const express = require("express");
const path = require("path");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const http = require('http');
const ta = require("time-ago");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const cooky = {
	secret: "work hard",
  resave: true,
  expires: new Date() * 60 * 60 * 24 * 7,
  saveUninitialized: true
};

app.set("trust proxy", 1);
app.use(session(cooky));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use((req,res, next) => {if(!req.session.user) req.session.user = false;next()});

app.get('/', function(req, res, next) {
  res.render('index');
});

// Port init
const port = normalizePort(process.env.PORT || 8080);
app.set('port', port);


//Start server
const server = http.createServer(app);

var io = require('socket.io')(server);

/**
  * Create websocket server
  */

var userList = []
io.on('connection', (client) => {
  client.on('typing', function (data) {
    io.sockets.emit('typing', {
      who:data.who
    });
  });
	client.on('msg', function(data) {
		io.sockets.emit('msg', {
			by:data.by,
			txt:data.txt,
			time:ta.ago(data.time)
		})
	});
  client.on('login', function (data) {
		userList.push(data.username);
		console.log(userList)
		client.emit('auth', {
			success:true,
			username:data.username,
			people:userList
		});
  });
});

// Listening
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

// Event listeners
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  if(process.stdout.clearLine) process.stdout.clearLine();
  if(process.stdout.cursorTo) process.stdout.cursorTo(0);
  process.stdout.write('Parler is listening on port '+addr.port+'\n');
}
