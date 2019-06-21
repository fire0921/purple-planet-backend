const express = require("express");
const session = require('express-session');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);
const login_api_controller = require("./controllers/login.js");
const check_user_status = require("./controllers/login.js").check_user_status;
const app = express();
const parseurl = require("parseurl")

app.use(cookieParser("express_react_cookie"));
app.use(session({
	secret: "express_react_cookie",
	store: new RedisStore({
		client: new Redis({
			host: "127.0.0.1",
			port: 6379
		})
	}),
	resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));

app.use(bodyParser.json({
	limit: "50mb"
}));

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static("public"));

app.use((req, res, next) => {
	res.append("Access-Control-Allow-Origin", "http://localhost:5000");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.header('Access-Control-Allow-Credentials', 'true')
	next();
});

app.get("/", (req, res) => {
	res.send("good");
});

app.post("/login", login_api_controller.login_api_controller);
app.get('/foo', function (req, res, next) {
  res.send('you viewed this page ' + req.session.JWTtoken + ' times')
})
app.get("/check/user/status", check_user_status);

const server = app.listen(8080, () => {
	const host = server.address().address;
	const port = server.address().port;

	console.log("http://%s:%s", host, port);
});
