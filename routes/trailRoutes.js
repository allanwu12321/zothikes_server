const mongoose = require("mongoose");

const Trail = mongoose.model("Trails");

module.exports = (app) => {
    app.get("/api/get_trails", async (req, res) => {
        const trails = await Trail.find({});
        res.send(trails);
    })
};