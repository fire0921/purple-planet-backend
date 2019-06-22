const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;
const url = "mongodb://localhost:27017/test";
const jwt = require("jsonwebtoken");
const API_KEYS = "TIMprojectSecrect";
const API_KEYS_Client = "ClentSecrectKeys";

exports.login_api_controller = function(req, res){

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
						req.session.JWTtoken = JWTtoken;
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
	const token = req.session.JWTtoken;
	if(token){
		console.log("has token");
		jwt.verify(token, API_KEYS, function(err, decoded){
			if(err)	{
				return res.status(500).json({ status: err.message });
			}else {
				return res.status(200).json({ status:"success" });
			}
		})
	}else{
		console.log("first login");
		return res.status(200).json({ status: "Error" });
	}
}
