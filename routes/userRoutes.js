module.exports = (app) => {
    app.get("/api/get_users", async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })
};
