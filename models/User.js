const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
    partitionKey: String,
    email: String,
    name: String,
    age: String,
    height: String,
    weight: String,
    gender: String,
    target_weight: String,
    latitude: String,
    longitude: String,
    trails_visited: {
        type: Map,
        of: Number
    },
}, {collection: "Users"});

mongoose.model("Users", userSchema);