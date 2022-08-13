const express = require("express");
const { addUser, whoIsOnline } = require("../controllers/userController");

const router = express.Router();

router.post("/user", addUser);
router.get("/who-is-online", whoIsOnline);

module.exports = {
  routes: router,
};
