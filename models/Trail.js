const mongoose = require("mongoose");
const { Schema } = mongoose;

const trailSchema = new Schema({
    name: String,
    difficulty: String,
    rating: String, 
    latitude: Number,
    longitude: Number,
    length: String,
    ttc: String,
    partitionKey: String,
});

mongoose.model("Trails", trailSchema);