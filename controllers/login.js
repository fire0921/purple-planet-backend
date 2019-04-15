const MongoClient = require("mongodb").MongoClient;
// const ObjectId = require("mongodb").ObjectId;

const url = "mongodb://localhost:27017/test";


exports.login_api_controller = function(req, res){
	MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
		if(err){
			console.log(err);
			return;
		}
		return new Promise((resolve, reject) => {
			const testdb = client.db("test").collection("test");
			const result = testdb.findOne({phone:req.body.phone});
			if(result){
				resolve(result);
			}else{
				const err = new Error("has some error ocurred!!!");
				reject(err);
			}
		}).then((msg) => {
			if(msg){
				res.json(msg);
			}else if(!msg){
				client.close();
				res.json({status:"No result!!"});
			}
		}).catch((err) => {
			throw err;
		}).then(() => {
			client.close();
		});
	});
};
exports.registered_api_controller = function(req, res){
	MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {
		if(err){
			console.log(err);
			return;
		}
		return new Promise((resolve, reject) => {
			const testdb = client.db("test").collection("test");
			const result = testdb.findOne();
			if(result){
				resolve(result);
			}else{
				const err = new Error("has some error ocurred!!!");
				reject(err);
			}
		}).then((msg) => {
			if(msg){
				console.log(msg);
				res.json(msg);
			}else{
				const err = new Error("No result!!");
				throw err;
			}
		}).catch((err) => {
			console.log(err.message);
		}).then(() => {
			client.close();
		});
	});
};
