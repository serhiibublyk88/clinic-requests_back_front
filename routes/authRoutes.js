//authRoutes.js;
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.showLoginPage);

router.post("/login", authController.login);

router.get("/", authController.showHomePage);

router.post("/logout", authController.logout);

module.exports = router;
