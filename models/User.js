const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    partitionKey: String,
    username: String,
    name: { lastName: String, firstName: String },
    age: Number,
    height: Number,
    weight: Number,
    gender: String,
    target_weight: Number,
});

mongoose.model("Users", userSchema);