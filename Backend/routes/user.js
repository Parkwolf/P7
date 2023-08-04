const express = require("express");
const router = express.Router();
const userRoutes = require("./routes/user");

const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

app.use("/api/stuff", stuffRoutes);
app.use("/api/auth", userRoutes);

module.exports = router;
