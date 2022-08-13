const axios = require("axios");
const { isSameDay } = require("date-fns");
const e = require("express");
const firebaseServer = require("firebase");

const firebase = require("./db");
const firestore = firebase.firestore();

const LIMIT_NOOM_PER_DAY = 6;

async function cronTwitch() {
  const runCron = await randomRunCron(0.8);

  if (!runCron) process.exit();

  console.log("Cron Running...");

  const creators = await getParteneredCreators(); // Cost: number of creators (to optimize if creators > 10)
  const onlineCreators = await getCreatorOnlineStatus(creators); // Cost: 0

  if (!onlineCreators.length) process.exit();

  console.log("onlineCreators >>>>> ", onlineCreators);

  const twitchViewers = await getTwitchViewers(onlineCreators); // Cost: 0
  // const firestoreUsers = await geFirestoreUsers(); // Deprecated : topo expensive - Cost: number of users - to optimize NOW
  const listConnectTwitch = await getListConnectTwitch(); // Cost: 1

  const users = twitchViewers.filter((value) =>
    listConnectTwitch.includes(value)
  );

  if (!users.length) process.exit();

  await dropNoomToUsers(users); // Cost: unknown - to optimize

  console.log("NOOM DROPPPPED LETS GOOO >>>>> ", users);

  process.exit();
}

async function getParteneredCreators() {
  try {
    const creatorsSnapshot = await firestore.collection("creator").get();

    const allCreators = await Promise.all(
      await creatorsSnapshot.docs.map(async (doc) => {
        const linkedUser = await doc.data().linkedUser.get();
        const linkedUserData = linkedUser.data();
        return linkedUserData.twitch.login;
      })
    );

    return allCreators;
  } catch (err) {
    console.log(err);
  }
}

async function getCreatorOnlineStatus(creators) {
  try {
    let onlineCreators = [];

    for (const creator of creators) {
      const result = await axios.get(`https://twitch.tv/${creator}`);
      if (result?.data?.includes("isLiveBroadcast")) {
        onlineCreators.push(creator);
      }
    }

    return onlineCreators;
  } catch (err) {
    console.log(err);
  }
}

async function getTwitchViewers(creators) {
  try {
    let totalViewers = [];

    for (const creator of creators) {
      const result = await axios.get(
        `https://tmi.twitch.tv/group/user/${creator}/chatters`
      );
      const { moderators, viewers } = result.data.chatters;
      totalViewers = totalViewers.concat(moderators, viewers);
    }

    return totalViewers;
  } catch (err) {
    console.log(err);
  }
}

async function geFirestoreUsers() {
  try {
    const usersSnapshot = await firestore.collection("user").get();

    // get all users in the database
    const allUsers = usersSnapshot.docs.map((doc) => {
      const twitchName = doc.data()?.twitch?.login;
      return twitchName;
    });

    // remove profile with no twitch id
    const users = allUsers.filter((item) => item);

    return users;
  } catch (err) {
    console.log(err);
  }
}

async function getListConnectTwitch() {
  try {
    const infosSnapshot = await firestore
      .collection("quickQuery")
      .doc("infos")
      .get();
    const infosData = await infosSnapshot.data();

    return infosData.listConnectTwitch;
  } catch (err) {
    console.log(err);
  }
}

async function dropNoomToUsers(users, amount) {
  let dropAmount = Number(
    amount || generateRandomDecimalInRangeFormatted(0.1, 0.8, 1)
  );

  const now = new Date(Date.now());

  const dropToUsers = await Promise.all(
    await users.map(async (user) => {
      let userIds = [];

      const userSnapshot = await firestore
        .collection("user")
        .where("twitch.login", "==", user)
        .get();

      if (userSnapshot.empty) {
        console.log("No matching documents.");
        return;
      }

      userSnapshot.forEach((doc) => {
        userIds.push(doc.id);
      });

      for (var i = 0; i < userIds.length; i++) {
        const wallet = userIds[i];

        console.log("drop to >>", wallet);
        const findUser = await firestore.collection("user").doc(wallet).get();
        const userDrops = await findUser.data()?.drops;

        const today = new Date();

        const fetchDropsToday =
          Math.round(
            (userDrops?.reduce((total, drop) => {
              if (!isSameDay(today, drop._createTimestamp.toDate()))
                return total;

              return (total += drop.amount);
            }, 0) || 0) * 10
          ) / 10;

        if (fetchDropsToday >= LIMIT_NOOM_PER_DAY) {
          return;
        } else if (fetchDropsToday + dropAmount > LIMIT_NOOM_PER_DAY) {
          dropAmount = LIMIT_NOOM_PER_DAY - fetchDropsToday;
        }

        const drop = {
          _createTimestamp: now,
          amount: dropAmount,
          redeemed: false,
        };

        await firestore
          .collection("quickQuery")
          .doc("infos")
          .update({
            totalDrop:
              firebaseServer.firestore.FieldValue.increment(dropAmount),
          });

        const drops = userDrops ? [...userDrops, drop] : [drop];

        await firestore.collection("user").doc(wallet).update({
          drops,
        });
      }
    })
  );
}

function generateRandomDecimalInRangeFormatted(min, max, places) {
  let value = Math.random() * (max - min) + min;
  return Number.parseFloat(value).toFixed(places);
}

// Deprecated, server time and local time may differ
async function getLastCron() {
  const QUERY_EVERY = "2"; // 1: every 10 minutes, 2: every 20 minutes, 3: every 30 minutes,..

  try {
    const infosSnapshot = await firestore
      .collection("quickQuery")
      .doc("infos")
      .get();
    const infosData = await infosSnapshot.data();

    const now = new Date();
    const lastCron = infosData.lastCron.toDate();

    var diff = Math.abs(now - lastCron);
    var diffMins = Math.round((diff % 86400000) % 3600000) / 60000;
    console.log(8 > QUERY_EVERY * 0.8);

    const isDropping = diffMins > QUERY_EVERY * 0.8;

    return isDropping;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function randomRunCron(dropChance) {
  return Math.random() < dropChance;
}

cronTwitch();
