const express = require("express");
const { twitchGetOauthToken } = require("../controllers/twitchController");

const router = express.Router();

router.post("/twitch-oauth-token", twitchGetOauthToken);

module.exports = {
  routes: router,
};
