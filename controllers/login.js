const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;
const request = require("request-promise");
const url = "mongodb://localhost:27017/test";
const jwt = require("jsonwebtoken");
const API_KEYS = "TIMprojectSecrect";
const API_KEYS_Client = "ClentSecrectKeys";
const fbapi_host = "https://graph.facebook.com/v3.3";

require("dotenv").config();

exports.login_api_controller = async function(req, res){

	jwt.verify(req.body.ctoken, API_KEYS_Client, function(err, decoded) {
		if(err){
			console.log("err", err.message);
			res.status(500).send("please input email/password");

		}else{
			let phone = decoded.phone;
			let Password = decoded.Password;

			MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
				if(err){
					console.log(err);
					return;
				}
				return new Promise((resolve, reject) => {
					const testdb = client.db("test").collection("test");
					const result = testdb.findOne({phone:phone});
					if(result){
						resolve(result);
					}else{
						const err = new Error("has some error ocurred!!!");
						reject(err);
					}
				}).then((msg) => {
					if(msg && Password === msg.password){
						let payload = {
							phone:msg.phone,
							Password:msg.password,
						}
						JWTtoken = jwt.sign(payload, API_KEYS, { expiresIn: "1 day" });
						req.session.currentUser = {
							"token": JWTtoken,
							"type": "origin",
						}
						res.json({
							__token:JWTtoken,
							currentUser: req.session.user,
						});
					}else {
						client.close();
						res.status(200).json({status:"No result!!"});
					}
				}).catch((err) => {
					res.status(500).send("please input email/password");
					console.log("err", err);
				}).then(() => {
					client.close();
				});
			});
		}
	});
};
exports.login_fb_api_controller = async function(req, res){
	const access_token = req.body.accessToken;

	const response = await request({
		method: "GET",
		url: fbapi_host + "/me?fields=id,name,email&access_token=" + access_token,
		json: true,
	});

	const res2 = await request({
			method: "GET",
			uri: fbapi_host+"/oauth/access_token?grant_type=fb_exchange_token&client_id="+process.env.REACT_APP_FBID+"&client_secret="+process.env.REACT_APP_FBS+"&fb_exchange_token="+access_token,
			json: true
		});

	req.session.currentUser = {
		"token": res2.access_token,
		"type": "FB",
	}
	res.json({
		user: req.session.currentUser,
		status: "success"
	});
}
exports.check_user_status = async function(req, res){
	if(!req.session.currentUser){
		console.log("first login");
		return res.status(200).json({ status: "Error" });
	}
	const token = req.session.currentUser.token;
	const type = req.session.currentUser.type;
	if(token && type === "origin"){
		console.log("has token");
		jwt.verify(token, API_KEYS, function(err, decoded){
			if(err)	{
				return res.status(500).json({ status: err.message });
			}else {
				return res.status(200).json({ status:"success" });
			}
		})
	}else if (type === "FB"){

		response = await request({
			method: "GET",
			uri: fbapi_host+"/oauth/access_token?grant_type=client_credentials&client_id="+process.env.REACT_APP_FBID+"&client_secret="+process.env.REACT_APP_FBS,
			json: true
		}).catch((err) => {console.log(err.message)});

		const credentitals = response.access_token;

		response = await request({
			method: "GET",
			uri: "https://graph.facebook.com/debug_token?input_token="+token+"&access_token="+credentitals,
			json:true,
		}).catch((err) => {console.log(err.message)});
		console.log(response);
		if(response.data.is_valid){
			return res.status(200).json({status:"success"});
		}else{
			return res.status(200).json({ status:"Error" });
		}
	}else{
		console.log("first login");
		return res.status(200).json({ status: "Error" });
	}
}
