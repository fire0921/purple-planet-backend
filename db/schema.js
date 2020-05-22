const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	phone: String,
	password: String,
});

userSchema.path("_id");

const userModel = mongoose.model("user", userSchema);
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

mongoose
	.model("user")
	.find({ phone: "0911111111" }, "phone,password", function (err, user) {
		if (user.length === 0) {
			mongoose
				.model("user")
				.create({ phone: "0911111111", password: "admin" }, function (
					err,
					awesome_instance
				) {
					if (err) return handleError(err);
					// saved!
				});
		} else {
			console.log("mongodb already!!");
		}
	});
exports.userModel = userModel;
