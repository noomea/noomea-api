"use strict";

const { default: axios } = require("axios");
const firebase = require("../db");
const firestore = firebase.firestore();

const addUser = async (req, res, next) => {
  try {
    const data = req.body;
    await firestore.collection("user").doc().set(data);
    res.send("Record saved successfuly");
  } catch (err) {
    res.status(400).send(error.message);
  }
};

const whoIsOnline = async (req, res, next) => {
  try {
    const creatorsSnapshot = await firestore.collection("creator").get();

    const allCreators = await Promise.all(
      await creatorsSnapshot.docs.map(async (doc) => {
        const linkedUser = await doc.data().linkedUser.get();
        const linkedUserData = linkedUser.data();
        return linkedUserData.twitch.login;
      })
    );

    let onlineCreators = [];

    for (const creator of allCreators) {
      const result = await axios.get(`https://twitch.tv/${creator}`);
      if (result?.data?.includes("isLiveBroadcast")) {
        onlineCreators.push(creator);
      }
    }

    res.send(onlineCreators);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = {
  addUser,
  whoIsOnline,
};
