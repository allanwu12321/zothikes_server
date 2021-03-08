const mongoose = require("mongoose");

const User = mongoose.model("Users");

module.exports = (app) => {
    app.get("/api/get_users", async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })

    app.post("/api/post_user", async(req, res) => {
        const { username, name /*whatever other user fields*/ } = req.body;
        //see if there is a user with the same name or something
        var user = await User.findOne({ name: "allan" });
        if(!user){
            await new User({
                partitionKey: "PEOPLE",
                name: "allan",
                username: "allan123",
                age: 21,
                height: 70,
                weight: 321,
                gender: "male",
                target_weight: 300,
            }).save();
        }
    })
};
