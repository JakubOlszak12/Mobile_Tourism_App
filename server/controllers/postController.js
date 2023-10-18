/* eslint-disable max-len */
/* eslint-disable linebreak-style */
'use strict';

const firebase = require('../database');
const firestore = firebase.firestore();
const db_users = firestore.collection('User');
const db_posts = firestore.collection('Post');
const {dirname} = require('path');
const appDir = dirname(require.main.filename);
const fs = require('fs-extra');
const shortid = require('shortid');
const admin = require('firebase-admin');
const Post = require('../models/Post');
const db_follows = firestore.collection('Follow');

const addPost = async (req, res) => {
  try {
    const user = await db_users
        .where('__name__', '==', req.user)
        .get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Problem z weryfikacją użytkownika. Zaloguj się ponownie'});
    }
    let {imageName, text} = req.body;
    if ( text.trim() === '') {
      return res.status(400).json({message: 'Pole tekstowe nie może być puste'});
    }
    if (imageName != '') {
      const bucket = admin.storage().bucket();
      const path = appDir + '/public/' + imageName; // znajdz obrazek na lokalnym serwerze
      imageName = shortid.generate() + '-' + imageName; // wygeneruj losową nazwę obrazka
      await bucket.upload(path, {destination: 'posts/' + imageName}); // upload zdjęcia do storage
      fs.remove(path); // usuń zdjęcie z lokalnego serwera
    }
    const newPost = new Post(imageName, text, 'post', new Date(), user.docs[0].id, user.docs[0].data().username, user.docs[0].data().avatar);
    await db_posts.doc().set(Object.assign({}, newPost));
    res.json('Dodałeś post');
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};


const getPosts = async (req, res) => {
  try {
    let follows = await db_follows.where('follower', '==', req.user).get();
    follows = follows.docs.map((doc) => doc.data());
    const usersIdArray = [];
    for (let i = 0; i<follows.length; i++) {
      const element = follows[i].following;
      usersIdArray.push(element);
    }
    usersIdArray.push(req.user);
    const afterDoc = await db_posts.doc(req.params.lastId).get();
    let posts;
    if (!afterDoc) {
      return res.json([]);
    } else if (afterDoc.data() === undefined) {
      posts = await db_posts
          .where('userId', 'in', usersIdArray)
          .orderBy('timestamp', 'desc')
          .limit(10)
          .get();
    } else {
      posts = await db_posts
          .where('userId', 'in', usersIdArray)
          .orderBy('timestamp', 'desc')
          .startAfter(afterDoc)
          .limit(10)
          .get();
    }
    if (!posts.docs[0]) {
      return res.json([]);
    }
    const postsArray = posts.docs.map((doc) => doc.data());
    let url = '';
    const bucket = admin.storage().bucket();
    for (let i = 0; i < postsArray.length; i++) {
      const element = postsArray[i];
      element.postId = posts.docs[i].id;
      const currentUser = await db_users.where('__name__', '==', element.userId).get();
      if (element.imageName !== '') {
        let file;
        switch (element.type) {
          case 'achievement':
            file = bucket.file('achievements/' + element.imageName);
            break;
          default:
            file = bucket.file('posts/' + element.imageName);
            break;
        }
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
              element.imageName = url;
            });
      }
      if (currentUser.docs[0].data().avatar !== '') {
        const file = bucket.file(currentUser.docs[0].data().avatar);
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
              element.avatar = url;
            });
      } else element.avatar = '';
      postsArray[i] = element;
    }
    return res.json(postsArray);
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};

const getUserPosts = async (req, res) => {
  try {
    const user = await db_users.where('username', '==', req.params.username).get();
    if (!user.docs[0]) {
      return res
          .status(400)
          .json({
            message: 'Nie znaleziono użytkownika z taką nazwą',
          });
    }
    const afterDoc = await db_posts.doc(req.params.lastId).get();
    let posts;
    if (!afterDoc) {
      return res.json([]);
    } else if (afterDoc.data() === undefined) {
      posts = await db_posts
          .where('userId', '==', user.docs[0].id)
          .orderBy('timestamp', 'desc')
          .limit(10)
          .get();
    } else {
      posts = await db_posts
          .where('userId', '==', user.docs[0].id)
          .orderBy('timestamp', 'desc')
          .limit(10)
          .startAfter(afterDoc)
          .get();
    }
    if (!posts.docs[0]) {
      return res.json([]);
    }
    const postsArray = posts.docs.map((doc) => doc.data());
    let url = '';
    const bucket = admin.storage().bucket();
    for (let i = 0; i < postsArray.length; i++) {
      const element = postsArray[i];
      element.postId = posts.docs[i].id;
      if (element.imageName !== '') {
        let file;
        switch (element.type) {
          case 'achievement':
            file = await bucket.file('achievements/' + element.imageName);
            break;
          default:
            file = await bucket.file('posts/' + element.imageName);
            break;
        }
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
              element.imageName = url;
            });
      }
      if (user.docs[0].data().avatar !== '') {
        const file = bucket.file(user.docs[0].data().avatar);
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
              element.avatar = url;
            });
      } else element.avatar = '';

      postsArray[i] = element;
    }
    return res.json(postsArray);
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};
const deletePost = async (req, res) => {
  try {
    const post = await db_posts.where('__name__', '==', req.params.id)
        .where('userId', '==', req.user)
        .get();
    if (!post.docs[0]) {
      return res.status(400).json({message: 'Nie udało się odnaleźć tego posta'});
    } else {
      if (post.docs[0].data().type !== 'post') {
        return res.status(400).json({message: 'Nie można usunąć postu typu osiągnięcie'});
      }
      const bucket = admin.storage().bucket();
      if (post.docs[0].data().imageName != '') {
        await bucket.file('posts/' + post.docs[0].data().imageName).delete();
      }
      await db_posts.doc(post.docs[0].id).delete();
      return res.json('Pomyślnie usunięto post');
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const editPost = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    if (!user.docs[0]) {
      return res
          .status(400)
          .json({
            message: 'Problem z weryfikacją użytkownika. Zaloguj się ponownie',
          });
    }
    let {imageName, text} = req.body;
    console.log(req.body);
    if (text.trim() === '') {
      return res
          .status(400)
          .json({message: 'Pole tekstowe nie może być puste'});
    }
    const post = await db_posts
        .where('__name__', '==', req.params.id)
        .where('userId', '==', req.user)
        .get();
    if (!post.docs[0]) {
      return res.status(400).json({message: 'Problem z wczytaniem danych postu, spróbuj ponownie później'});
    }
    if (post.docs[0].data().type === 'achievement') {
      return res
          .status(400)
          .json({message: 'Nie można edytować achievementów'});
    }
    if (imageName != '' && imageName !== post.docs[0].data().imageName) {
      const bucket = admin.storage().bucket();
      if (post.docs[0].data().imageName != '') {
        await bucket.file('posts/'+ post.docs[0].data().imageName).delete();
      }
      const path = appDir + '/public/' + imageName; // znajdz obrazek na lokalnym serwerze
      imageName = shortid.generate() + '-' + imageName; // wygeneruj losową nazwę obrazka
      await bucket.upload(path, {destination: 'posts/' + imageName}); // upload zdjęcia do storage
      fs.remove(path); // usuń zdjęcie z lokalnego serwera
    } else {
      imageName = post.docs[0].data().imageName;
    }
    await db_posts.doc(post.docs[0].id).update({
      imageName: imageName,
      text: text,
      edited_at: new Date(),
    });
    res.json('Edytowano post');
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};

const getEditData = async (req, res) => {
  try {
    const post = await db_posts.where('__name__', '==', req.params.id).where('userId', '==', req.user).get();
    if (!post.docs[0]) {
      return res.status(400).json({message: 'Problem z wczytaniem danych posta'});
    } else {
      if (post.docs[0].data().type === 'achievement') {
        return res.status(400).json({message: 'Nie można edytować achievementów'});
      }
      let url = '';
      const bucket = admin.storage().bucket();
      if (post.docs[0].data().imageName !== '') {
        const file = await bucket.file(
            'posts/' + post.docs[0].data().imageName,
        );
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
            });
      }
      return res.json({
        imageName: post.docs[0].data().imageName,
        text: post.docs[0].data().text,
        type: post.docs[0].data().type,
        userId: post.docs[0].data().userId,
        url: url,
      });
    }
  } catch (err) {
    return res.status(400).json({message: err.message});
  }
};

module.exports = {
  addPost,
  getPosts,
  getUserPosts,
  deletePost,
  editPost,
  getEditData,
};
