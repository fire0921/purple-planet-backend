const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;
const url = "mongodb://localhost:27017/test";
const jwt = require("jsonwebtoken");

exports.login_api_controller = function(req, res){
	if(req.body.__token){
		let API_KEYS = "TIMprojectSecrect";
	}else{
		API_KEYS = "ClentSecrectKeys";
	}
	jwt.verify(req.body.ctoken, API_KEYS, function(err, decoded) {
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
						JWTtoken = jwt.sign(payload, "TIMprojectSecrect", { expiresIn: "1 day" });
						req.session.JWTtoken = { "JWTtoken": JWTtoken };
						res.json({
							__token:JWTtoken,
							user: req.session.JWTtoken,
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
exports.check_user_status = function(req, res){
	if(req.session.JWTtoken){
		res.status(200).json({ status:"success" });
	}else{
		res.status(200).json({ status: "Error" });
	}
}
