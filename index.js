const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
const passport = require("passport");

require("./models/Trail");
require("./models/User");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true, dbName: "CS125_test1"});

const app = express();

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

require("./routes/userRoutes")(app);
require("./routes/trailRoutes")(app);
require("./routes/recommendationRoute")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);