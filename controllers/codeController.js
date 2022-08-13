"use strict";

const firebaseServer = require("firebase");

const firebase = require("../db");
const firestore = firebase.firestore();

const generateCode = async (req, res, next) => {
  try {
    const data = {
      _createTimestamp: firebaseServer.firestore.FieldValue.serverTimestamp(),
      used: false,
    };

    const { id } = await firestore.collection("code").add(data);
    res.json({ id });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  generateCode,
};
