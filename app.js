const login_api_controller = require("./controllers/login.js");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();


//教學網址 ：http://www.runoob.com/nodejs/nodejs-express-framework.html
app.use(express.static("public"));
app.use(bodyParser.json({
	limit: "50mb"
}));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use((req, res, next) => {
	res.append("Access-Control-Allow-Origin", ["*"]);
	res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
	res.append("Access-Control-Allow-Headers", "Content-Type");
	next();
});
app.get("/", (req, res) => {
	res.send("good");
});

app.get("/login", (req,res) => {
	res.send("Login");
});


app.post("/login", login_api_controller.login_api_controller);

const server = app.listen(8080, () => {
	const host = server.address().address;
	const port = server.address().port;

	console.log("http://%s:%s", host, port);
});
