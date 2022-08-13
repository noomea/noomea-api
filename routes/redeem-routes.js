const express = require("express");
const { redeemTokens } = require("../controllers/redeemController");

const router = express.Router();

router.post("/redeem-tokens", redeemTokens);

module.exports = {
  routes: router,
};
