"use strict";

const { default: axios } = require("axios");
const { TWITCH_API_CLIENT_SECRET } = require("../config");

const twitchGetOauthToken = async (req, res, next) => {
  const clientId = req.body.clientId;
  if (!clientId) return res.send("No clientId params");

  const returnUrl = req.body.returnUrl;
  if (!returnUrl) return res.send("No returnUrl params");

  const code = req.body.code;
  if (!code) return res.send("No code params");

  try {
    const response = await axios.post(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${TWITCH_API_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${returnUrl}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  twitchGetOauthToken,
};
