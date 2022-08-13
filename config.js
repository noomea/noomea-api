const dotenv = require("dotenv");
const assert = require("assert");

dotenv.config();

const {
  PORT,
  HOST,
  HOST_URL,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SEND_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
  NOOMEA_TOKEN_WALLET_SECRET,
  TWITCH_API_CLIENT_SECRET,
} = process.env;

assert(PORT, "Port is required");
assert(HOST, "Host is required");

module.exports = {
  port: PORT,
  host: HOST,
  url: HOST_URL,
  firebaseConfig: {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SEND_ID,
    appId: FIREBASE_APP_ID,
    measurementId: FIREBASE_MEASUREMENT_ID,
  },
  NOOMEA_TOKEN_WALLET_SECRET,
  TWITCH_API_CLIENT_SECRET,
};
