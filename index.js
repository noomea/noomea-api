const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const config = require("./config");
const userRoutes = require("./routes/user-routes");
const codeRoutes = require("./routes/code-routes");
const redeemRoutes = require("./routes/redeem-routes");
const twitchRoutes = require("./routes/twitch-routes");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to NOOMEA APIII");
});

app.get("/who-is-online", userRoutes.routes);

app.get("/generate-code", codeRoutes.routes);

app.post("/redeem-tokens", redeemRoutes.routes);

app.post("/twitch-oauth-token", twitchRoutes.routes);

app.listen(config.port, () => console.log("App is listening ..."));
