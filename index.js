const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const passport = require("passport");

require("./models/Trail");
require("./models/User");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

const Trail = mongoose.model("Trails");
const User = mongoose.model("Users");

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

//require("./routes/trailRoutes");

// async function testing(){
//     await new User({
//         paritionKey: "PEOPLE",
//         username: "username",
//         name: "Rio",
//         age: "13",
//         height: "52",
//         weight: "123",
//         gender: "m",
//         target_weight: "132",
//     });
// }

//testing();

app.get("/api/get_users", async (req, res) => {
    const users = await User.find({});
    res.send(users);
})

require("./routes/userRoutes");

const PORT = process.env.PORT || 5000;
app.listen(PORT);