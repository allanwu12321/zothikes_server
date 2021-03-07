const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const passport = require("passport");

require("./models/Trail");
require("./models/User");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI);

// const Trail = mongoose.model("Trails");
// const User = mongoose.model("Users");

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

//require("./routes/trailRoutes");

// async function testing_user(){
//     await new User({
//         paritionKey: "PEOPLE",
//         username: "username",
//         name: "Rio",
//         age: "13",
//         height: "52",
//         weight: "123",
//         gender: "m",
//         target_weight: "132",
//     }).save();
// }

// testing_user();

// async function testing_trail(){
//     await new Trail({
//         name: "trail",
//         difficulty: "hard",
//         rating: "some rating",
//         latitude: 123,
//         longitude: 321,
//         length: 12345,
//         ttc: "some ttc",
//         partitionKey: "TRAILS",
//     }).save();
// }

// testing_trail();

require("./routes/userRoutes")(app);
require("./routes/trailRoutes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);