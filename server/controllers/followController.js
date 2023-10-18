/* eslint-disable require-jsdoc */
/* eslint-disable brace-style */
'use strict';

const firebase = require('../database');
const Follow = require('../models/Follow');
const firestore = firebase.firestore();

const db_users = firestore.collection('User');
const db_follows = firestore.collection('Follow');
const admin = require('firebase-admin');
const bucket = admin.storage().bucket();

async function addNotification(text, user, reference, type) {
  const currentUserNotifications = user.docs[0].data().notifications;
  for (let i = 0; i<currentUserNotifications.length; i++) {
    const element = currentUserNotifications[i];
    if (element.type === type && element.ref === reference.docs[0].data().username) {
      return true;
    }
  };
  currentUserNotifications.push({
    text: text,
    timestamp: new Date(),
    ref: reference.docs[0].data().username,
    type: type,
  });
  await db_users.doc(user.docs[0].id).update({
    notifications: currentUserNotifications,
  });
}

const followUser = async (req, res) => {
  try {
    const userFollows = await db_users.where('__name__', '==', req.user).get();
    if (!userFollows.docs[0]) {
      return res.status(400).json({message: 'Problem z weryfikacją użytkownika'});
    }
    const userFollowed = await db_users
        .where('username', '==', req.params.username.toLowerCase())
        .get();
    if (!userFollowed.docs[0]) {
      return res.status(400).json({message: 'Nie odnaleziono użytkownika'});
    }
    if (userFollowed.docs[0].id === userFollows.docs[0].id) {
      return res.status(400).json({message: 'Nie możesz obserwować samego siebie.'});
    }
    const follows = await db_follows
        .where('follower', '==', userFollows.docs[0].id)
        .where('following', '==', userFollowed.docs[0].id)
        .get();
    if (follows.docs[0]) {
      await db_users.doc(userFollows.docs[0].id).update({
        follows: userFollows.docs[0].data().follows - 1,
      });
      await db_users.doc(userFollowed.docs[0].id).update({
        followers: userFollowed.docs[0].data().followers - 1,
      });
      await db_follows.doc(follows.docs[0].id).delete();
      return res.json('Usunięto followa');
    }
    else {
      const newFollow = new Follow(userFollows.docs[0].id, userFollowed.docs[0].id);
      await db_follows.doc().set(Object.assign({}, newFollow));
      await db_users.doc(userFollows.docs[0].id).update({
        follows: userFollows.docs[0].data().follows + 1,
      });
      await db_users.doc(userFollowed.docs[0].id).update({
        followers: userFollowed.docs[0].data().followers + 1,
      });
      addNotification(
          'Użytkownik ' +
          userFollows.docs[0].data().username +
          ' teraz cię obserwuje',
          userFollowed,
          userFollows,
          'follow',
      );
      return res.json('Dodano followa');
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// funkcja która sprawdza kto followuje podaną osobę, zwraca listę osób
const findFollowers = async (req, res) => {
  try {
    const user = await db_users
        .where('username', '==', req.params.username.toLowerCase())
        .get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Nie ma takiego użytkownika'});
    }
    // tablica wszystkich id followersow uzytkownika
    const followers = await db_follows
        .where('following', '==', user.docs[0].id)
        .get();
    if (!followers.docs[0]) {
      return res.json([]);
    }
    const followersArray = followers.docs.map((doc) => doc.data());
    const allElements = [];
    // nie mozna uzywac foreach tutaj --> patrz https://zellwk.com/blog/async-await-in-loops/
    /*
        If you want to execute await calls in series, use a for-loop (or any loop without a callback).
        Don’t ever use await with forEach. Use a for-loop (or any loop without a callback) instead.
        Don’t await inside filter and reduce. Always await an array of promises with map, then filter or reduce accordingly.
        */
    for (let i = 0; i < followersArray.length; i++) {
      // znajduje uzytkownika o danym id
      const currentUser = await db_users
          .where('__name__', '==', followersArray[i].follower)
          .get();
      let url = '';
      // dodaje do tablicy dane o followersie
      if (currentUser.docs[0].data().avatar !== '') {
        const file = bucket.file(currentUser.docs[0].data().avatar);
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
            });
      }
      // dodaje do tablicy dane o followersie
      allElements.push({
        username: currentUser.docs[0].data().username,
        followers: currentUser.docs[0].data().followers,
        follows: currentUser.docs[0].data().follows,
        avatar: url,
      });
    }

    // zwracam tablice wszystkich followersow
    return res.json(allElements);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

// funkcja która sprawdza kogo folowuje podana osoba, zwraca listę osób
const findFollows = async (req, res) => {
  try {
    const user = await db_users
        .where('username', '==', req.params.username.toLowerCase())
        .get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Nie ma takiego użytkownika'});
    }
    // tablica wszystkich id followersow uzytkownika
    const following = await db_follows
        .where('follower', '==', user.docs[0].id)
        .get();
    if (!following.docs[0]) {
      return res.json([]);
    }
    const followingArray = following.docs.map((doc) => doc.data());
    const allElements = [];
    // nie mozna uzywac foreach tutaj --> patrz https://zellwk.com/blog/async-await-in-loops/
    /*
        If you want to execute await calls in series, use a for-loop (or any loop without a callback).
        Don’t ever use await with forEach. Use a for-loop (or any loop without a callback) instead.
        Don’t await inside filter and reduce. Always await an array of promises with map, then filter or reduce accordingly.
        */
    for (let i = 0; i < followingArray.length; i++) {
      // znajduje uzytkownika o danym id
      const currentUser = await db_users
          .where('__name__', '==', followingArray[i].following)
          .get();
      let url = '';
      // dodaje do tablicy dane o followersie
      if (currentUser.docs[0].data().avatar !== '') {
        const file = bucket.file(currentUser.docs[0].data().avatar);
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
            });
      }
      allElements.push({
        username: currentUser.docs[0].data().username,
        followers: currentUser.docs[0].data().followers,
        follows: currentUser.docs[0].data().follows,
        avatar: url,
      });
    }

    // zwracam tablice wszystkich followersow
    return res.json(allElements);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

module.exports = {
  followUser,
  findFollowers,
  findFollows,
};
