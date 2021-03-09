const mongoose = require("mongoose");

const User = mongoose.model("Users");

module.exports = (app) => {
    app.get("/api/get_users", async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })

    app.post("/api/post_user", async(req, res) => {
        const { name, email, age, height, weight, gender, target_weight, latitude, longitude /*whatever other user fields*/ } = req.body;
        //see if there is a user with the same name or something
        var user = await User.findOne({ email: email });
        if(!user){
            await new User({
                partitionKey: "PEOPLE",
                name: name,
                email: email,
                age: age,
                height: height,
                weight: weight,
                gender: gender,
                target_weight: target_weight,
                latitude: latitude,
                longitude: longitude
            }).save();
        }
    })
};
