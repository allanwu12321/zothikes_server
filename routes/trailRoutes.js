const mongoose = require("mongoose");

const Trail = mongoose.model("Trails");
const User = mongoose.model("Users");


module.exports = (app) => {
    app.get("/api/get_trails", async (req, res) => {
        const { email, } = req.body;
        const user = await User.findOne({email:email}); //Data about user is stored here
        if (user){
            //Do whatever is needed for recommendation and store it in trails.
            const trails = await Trail.find({}) //for now it just finds all trails.
            res.send(trails);
        }
        
    })
};