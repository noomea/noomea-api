const express = require("express");
const { generateCode } = require("../controllers/codeController");

const router = express.Router();

router.get("/generate-code", generateCode);

module.exports = {
  routes: router,
};
