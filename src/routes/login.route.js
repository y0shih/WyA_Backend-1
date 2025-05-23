// Import libraries
const express = require("express")
const loginRouter = express.Router()

// Import controller
const loginController = require("../controllers/login.controller")

// Login route
loginRouter.use("/", loginController.loginAccount)

module.exports = loginRouter