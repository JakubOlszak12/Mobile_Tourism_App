/* eslint-disable no-var */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
'use strict';

const firebase = require('../database');
const User = require('../models/User');
const firestore = firebase.firestore();
const db_follows = firestore.collection('Follow');
const bcrypt = require('bcryptjs');
const db_users = firestore.collection('User');
const jwt = require('jsonwebtoken');
const {dirname} = require('path');
const appDir = dirname(require.main.filename);
const admin = require('firebase-admin');
const shortid = require('shortid');
const fs = require('fs-extra');
const nodemailer = require('nodemailer');

const registerUser = async (req, res) => {
  try {
    // definicja zmiennych z formularza
    let {email, password, passwordCheck, username} = req.body;
    username = username.toLowerCase();
    email = email.trim();
    // walidacja zmiennych z formularza
    if (!email || !password || !passwordCheck || !username) {
      return res
          .status(400)
          .json({message: 'Nie wszystkie pola zostały wypełnione'});
    }

    if (password.length < 5) {
      return res.status(400).json({message: 'Hasło za krótkie!'});
    } else if (password.search(/\d/) == -1) {
      return res.status(400).json({message: 'Hasło nie posiada liczb!'});
    } else if (password.search(/[a-zA-Z]/) == -1) {
      return res.status(400).json({message: 'Hasło nie posiada liter!'});
    } else if (password.search(/[A-Z]/) == -1) {
      return res
          .status(400)
          .json({message: 'Hasło nie posiada wielkich liter!'});
    }
    if (password !== passwordCheck) {
      return res.status(400).json({message: 'Hasła nie są takie same!'});
    }

    const existEmail = await db_users.where('email', '==', email).get();
    if (!existEmail.empty) {
      return res
          .status(400)
          .json({message: 'Email jest już zarejestrowany!'});
    }

    const existUsername = await db_users
        .where('username', '==', username)
        .get();
    if (!existUsername.empty) {
      return res
          .status(400)
          .json({message: 'Nazwa użytkownika jest już w użyciu!'});
    }

    // hashowanie hasła
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // data utworzenia
    const dateRaw = new Date();

    // tworzenie nowego użytkownika w bazie danych
    /*  email: email,
                password: passwordHash,
                username: username,
                description: "",
                created_at: dateRaw,
                edited_at: dateRaw,
                last_logon: "",
                account_typeId: 0,
                statusId: 1
            */

    const newUser = new User(
        email,
        passwordHash,
        username,
        '',
        dateRaw,
        dateRaw,
        '',
        0,
        1,
        0,
        0,
        0,
        [],
        '',
        [],
    );
    await db_users.doc().set(Object.assign({}, newUser));
    res.json('Rejestracja udana!');
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const loginUser = async (req, res) => {
  try {
    const {email, password} = req.body;
    if (email === '' || password === '') {
      return res
          .status(400)
          .json({message: 'Nie wszystkie pola zostały wypełnione!'});
    }

    const user = await db_users.where('email', '==', email).get();
    if (user.empty) {
      return res.status(400).json({message: 'Użytkownik nie istnieje!'});
    }
    const match = await bcrypt.compare(password, user.docs[0].data().password);
    if (!match) return res.status(400).json({message: 'Złe hasło!'});
    // console.log(user.docs[0].id); <- dostanie id dokumentu
    const token = jwt.sign(
        {id: user.docs[0].id, email: user.docs[0].data().email},
        process.env.JWT_SECRET,
    );
    res.json({
      token,
      user: {
        id: user.docs[0].id,
        username: user.docs[0].data().username,
      },
    });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const tokenValidUser = async (req, res) => {
  try {
    const token = req.header('token');
    if (!token) return res.json(false);
    const isVerified = jwt.verify(token, process.env.JWT_SECRET);
    if (!isVerified) return res.json(false);
    // const user = await User.findById(isVerified.id);
    // console.log(isVerified.id);
    const user = await db_users.where('__name__', '==', isVerified.id).get();
    // console.log(user.docs[0].id);
    if (!user) return res.json(false);
    return res.json(true);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};
// funkcja zwracajaca wszystkie dane o uzytkowniku
const getUserData = async (req, res) => {
  // console.log(req.user);
  const user = await db_users.where('__name__', '==', req.user).get();
  if (!user.docs[0]) {
    return res.status(400).json({message: 'Problem z weryfikacja uzytkownika. Zaloguj sie ponownie'});
  }
  let url = '';
  if (user.docs[0].data().avatar === '') {
    return res.json({
      id: user.docs[0].id,
      email: user.docs[0].data().email,
      username: user.docs[0].data().username, // nazwa użytkownika
      description: user.docs[0].data().description, // opis użytkownika
      followers: user.docs[0].data().followers, // lista id użytkowników, którzy followują
      follows: user.docs[0].data().follows, // lista id użytkowników, których followuje
      achievements: user.docs[0].data().achievements.length, // lista id zdobytych osiągnięć
      finished_routes: user.docs[0].data().finished_routes, // liczba ukonczonych tras
      avatar: url,
    });
  }
  const bucket = admin.storage().bucket();
  const file = bucket.file(user.docs[0].data().avatar);

  file
      .getSignedUrl({
        action: 'read',
        expires: '03-09-2030',
      })
      .then((signedUrls) => {
        url = signedUrls[0];
        console.log(url);
        return res.json({
          id: user.docs[0].id,
          email: user.docs[0].data().email,
          username: user.docs[0].data().username, // nazwa użytkownika
          description: user.docs[0].data().description, // opis użytkownika
          followers: user.docs[0].data().followers, // lista id użytkowników, którzy followują
          follows: user.docs[0].data().follows, // lista id użytkowników, których followuje
          achievements: user.docs[0].data().achievements.length, // lista id zdobytych osiągnięć
          finished_routes: user.docs[0].data().finished_routes, // liczba ukonczonych tras
          avatar: url,
        });
      });
};

const getEditUserData = async (req, res) => {
  const user = await db_users.where('__name__', '==', req.user).get();
  if (user.docs[0].data().avatar != '') {
    const bucket = admin.storage().bucket();
    const file = bucket.file(user.docs[0].data().avatar);
    await file
        .getSignedUrl({
          action: 'read',
          expires: '03-09-2030',
        })
        .then((signedUrls) => {
          const url = signedUrls[0];
          console.log(url);
          return res.json({
            email: user.docs[0].data().email,
            username: user.docs[0].data().username, // nazwa użytkownika
            description: user.docs[0].data().description, // opis użytkownika
            avatar: url,
          });
        });
  } else {
    return res.json({
      email: user.docs[0].data().email,
      username: user.docs[0].data().username, // nazwa użytkownika
      description: user.docs[0].data().description, // opis użytkownika
      avatar: '',
    });
  }
};

const editUserData = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    // console.log(user.docs[0].id);
    if (!user) return res.json(false);

    // definicja zmiennych z formularza

    let {
      email,
      newPassword,
      newPasswordCheck,
      username,
      description,
      currentPassword,
      imagename,
    } = req.body;
    const match = bcrypt.compare(
        currentPassword,
        user.docs[0].data().password,
    );

    if (!match) {
      return res.status(400).json({message: 'Podałeś złe obecne hasło'});
    }
    // description może być puste!!!
    if (imagename != '') {
      const bucket = admin.storage().bucket();
      if (user.docs[0].data().avatar != '') {
        // jeżeli użytkownik posiada avatar
        console.log('jest avatar');
        await bucket.file(user.docs[0].data().avatar).delete(); // usuń stary avatar z storage
      }
      const path = appDir + '/public/' + imagename; // znajdz obrazek na lokalnym serwerze
      imagename = shortid.generate() + '-' + imagename; // wygeneruj losową nazwę obrazka
      await bucket.upload(path, {destination: imagename}); // upload zdjęcia do storage
      fs.remove(path); // usuń zdjęcie z lokalnego serwera
    }

    // const storageRef = new Storage();
    // const bucket = storageRef.bucket("gs://tourismapp-809bd.appspot.com");

    // bucket.upload(path);
    //   await bucket.upload(
    //     path,
    //     {
    //         destination: 'my_uploaded_image.jpg',
    //         metadata: {
    //             cacheControl: "public, max-age=315360000",
    //             contentType: "image/jpeg"
    //      }
    // });

    // walidacja zmiennych z formularza
    if (!email || !username) {
      return res
          .status(400)
          .json({message: 'Nie wszystkie pola zostały wypełnione'});
    }

    if (description > 255) {
      return res
          .status(400)
          .json({message: 'Opis nie może mieć więcej niż 255 znaków'});
    }

    if (!currentPassword) {
      return res.status(400).json({message: 'Musisz podać obecne hasło!'});
    }

    const existEmail = await db_users.where('email', '==', email).get();
    if (
      !existEmail.empty &&
      user.docs[0].data().email != existEmail.docs[0].data().email
    ) {
      return res
          .status(400)
          .json({message: 'Email jest już zarejestrowany!'});
    }

    const existUsername = await db_users
        .where('username', '==', username)
        .get();
    if (
      !existUsername.empty &&
      user.docs[0].data().username != existEmail.docs[0].data().username
    ) {
      return res
          .status(400)
          .json({message: 'Nazwa użytkownika jest już w użyciu!'});
    }
    const dateRaw = new Date();
    if (newPassword === '' && imagename != '') {
      // aktualizacja danych użytkownika
      await db_users.doc(user.docs[0].id).update({
        email: email,
        username: username.toLowerCase(),
        description: description,
        edited_at: dateRaw,
        avatar: imagename,
      });
      return res.json('Zapisano pomyślnie');
    } else if (newPassword === '' && imagename === '') {
      await db_users.doc(user.docs[0].id).update({
        email: email,
        username: username.toLowerCase(),
        description: description,
        edited_at: dateRaw,
        avatar: user.docs[0].data().avatar,
      });
      return res.json('Zapisano pomyślnie');
    } else if (newPassword.length < 5) {
      return res.status(400).json({message: 'Hasło za krótkie!'});
    } else if (newPassword.search(/\d/) == -1) {
      return res.status(400).json({message: 'Hasło nie posiada liczb!'});
    } else if (newPassword.search(/[a-zA-Z]/) == -1) {
      return res.status(400).json({message: 'Hasło nie posiada liter!'});
    } else if (newPassword.search(/[A-Z]/) == -1) {
      return res
          .status(400)
          .json({message: 'Hasło nie posiada wielkich liter!'});
    }
    if (newPassword !== newPasswordCheck) {
      return res.status(400).json({message: 'Hasła nie są takie same!'});
    }

    // hashowanie hasła
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // aktualizacja danych użytkownika
    if (imagename != '') {
      db_users.doc(user.docs[0].id).update({
        email: email,
        username: username.toLowerCase(),
        password: passwordHash,
        description: description,
        edited_at: dateRaw,
        avatar: imagename,
      });
      res.json('Zapisano pomyślnie');
    }

    if (imagename === '') {
      db_users.doc(user.docs[0].id).update({
        email: email,
        username: username.toLowerCase(),
        password: passwordHash,
        description: description,
        edited_at: dateRaw,
      });
      res.json('Zapisano pomyślnie');
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};
// Znajduje uzytkownika po jego nazwie uzytkownika /api/userinfo/NAZWAUZYTKOWNIKA (patrz route) i zwraca dane o nim
const getUserInformation = async (req, res) => {
  // const user = await db_users.where('finished_routes', '==', 0).get();
  // return res.json(user.docs.map(doc => doc.data()));
  try {
    const user = await db_users
        .where('username', '==', req.params.username.toLowerCase())
    // .where('username', '<=', req.params.username)
    // .where('username', '<=', req.params.username+ '\uf8ff')
        .get();
    if (!user.docs[0]) {
      return res.json({message: 'Problem z wczytaniem danych użytkownika. Spróbuj ponownie później.'});
    }

    let isFollowed = 0;

    const ifFollowed = await db_follows
        .where('follower', '==', req.user)
        .where('following', '==', user.docs[0].id)
        .get();
    if (ifFollowed.docs[0]) {
      isFollowed = 1;
    }
    let url = '';
    console.log(user.docs[0].data().avatar);
    if (user.docs[0].data().avatar === '') {
      return res.json({
        id: user.docs[0].id,
        email: user.docs[0].data().email,
        username: user.docs[0].data().username, // nazwa użytkownika
        description: user.docs[0].data().description, // opis użytkownika
        followers: user.docs[0].data().followers, // lista id użytkowników, którzy followują
        follows: user.docs[0].data().follows, // lista id użytkowników, których followuje
        achievements: user.docs[0].data().achievements.length, // lista id zdobytych osiągnięć
        finished_routes: user.docs[0].data().finished_routes, // liczba ukonczonych tras
        isFollowed: isFollowed,
        avatar: url,
      });
    }

    // return res.json(user.docs.map(doc => doc.data()));

    const bucket = admin.storage().bucket();
    const file = bucket.file(user.docs[0].data().avatar);

    await file
        .getSignedUrl({
          action: 'read',
          expires: '03-09-2491',
        })
        .then((signedUrls) => {
          url = signedUrls[0];
          return res.json({
            id: user.docs[0].id,
            username: user.docs[0].data().username.toLowerCase(), // nazwa użytkownika
            description: user.docs[0].data().description, // opis użytkownika
            followers: user.docs[0].data().followers, // lista id użytkowników, którzy followują
            follows: user.docs[0].data().follows, // lista id użytkowników, których followuje
            achievements: user.docs[0].data().achievements.length, // lista id zdobytych osiągnięć
            finished_routes: user.docs[0].data().finished_routes, // liczba ukonczonych tras
            isFollowed: isFollowed,
            avatar: url,
          });
        });
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};


const findUsersPaginated = async (req, res) => {
  try {
    // znajdź użytkowników którzy zaczynają się na wpisaną nazwę lub są wpisaną nazwą
    if (req.params.username == '') {
      return res.json([]);
    }
    let users;
    users = await db_users
        .where('username', '>=', req.params.username.toLowerCase() )
        .where('username', '<=', req.params.username.toLowerCase() + '\uf8ff')
        .orderBy('username')
        .startAfter(req.params.startingPoint) // nazwa ostatniego użytkownika z poprzedniego requesta.
        .limit(5)
        .get();
    if (!users.docs[0]) {
      users = await db_users
        .where("username", ">=", req.params.username.toLowerCase())
        .where("username", "<=", req.params.username.toLowerCase() + "\uf8ff")
        .get();
    }
    // mapuje wyniki aby móc je wyświetlić (każdego usera)
    const data = users.docs.map((doc) => doc.data());
    const bucket = admin.storage().bucket();
    const allElements = [];


    for (let i = 0; i < data.length; i++) {
      var user = data[i];
      var url = '';
      if (user.avatar === '') {
        allElements.push({
          username: user.username,
          followers: user.followers,
          follows: user.follows,
          avatar: url,
        });
      } else {
        const file = await bucket.file(user.avatar);
        await file
            .getSignedUrl({
              action: 'read',
              expires: '03-09-2030',
            })
            .then((signedUrls) => {
              url = signedUrls[0];
              allElements.push({
                username: user.username,
                followers: user.followers,
                follows: user.follows,
                avatar: url,
              });
            });
      }
    }
    res.json(allElements);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const passwordResetRequest = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await db_users.where('email', '==', email).get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Użytkownik o podanym adresie email nie istnieje w bazie danych'});
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.BUSINESS_EMAIL, // email
        pass: process.env.APP_PASSWORD, // password
      },
    });
    const passwordGenerated = shortid.generate();
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(passwordGenerated, salt);

    await transporter.sendMail({
      to: email,
      subject: 'Prośba o reset hasła dla TourismApp',
      text: 'Została wysłana prośba o reset hasła. Twoje nowe wygenerowane hasło to: '+passwordGenerated+' zmień hasło po następnym logowaniu do aplikacji w celach bezpieczeństwa',
    });

    await db_users.doc(user.docs[0].id).update({
      password: passwordHash,
    });
    return res.json('Wysłano email z resetem hasła!');
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
};

const getUserNotifications = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    const notifications = user.docs[0].data().notifications;
    return res.json(notifications);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const getUserNotificationNumber = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    const notifications = user.docs[0].data().notifications.length;
    return res.json({notificationCount: notifications});
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const deleteUserNotification = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    const notifications = user.docs[0].data().notifications;
    if (req.params.id >= 0 && req.params.id < notifications.length) {
      notifications.splice(req.params.id, 1);
      await db_users.doc(req.user).update({
        notifications: notifications,
      });
    }
    return res.json('');
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const getRecommendedUsers = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    if (!user.docs[0]) {
      return res.status(400).json({
        message: 'Problem z weryfikacją użytkownika. Zaloguj się ponownie',
      });
    }
    let follows = await db_follows
        .where('follower', '==', user.docs[0].id)
        .get();
    follows = follows.docs.map((doc) => doc.data());
    const usersNameArray = [];
    for (let i = 0; i < follows.length; i++) {
      const element = follows[i].following;
      const currentUser = await db_users.where('__name__', '==', element).get();
      usersNameArray.push(currentUser.docs[0].data().username);
    }
    usersNameArray.push(user.docs[0].data().username);
    const recommended = await db_users
        .where('username', 'not-in', usersNameArray)
        .get();
    if (!recommended.docs[0]) {
      return res.json([]);
    } else {
      const recommendedArray = recommended.docs.map((doc) => doc.data());
      recommendedArray.sort( (a, b) => b.followers - a.followers);
      const results = [];
      for (let i = 0; i<3; i++) {
        const element = recommendedArray[i];
        let url = '';
        if (element.avatar !== '') {
          const bucket = admin.storage().bucket();
          const file = bucket.file(element.avatar);
          await file
              .getSignedUrl({
                action: 'read',
                expires: '03-09-2030',
              })
              .then((signedUrls) => {
                url = signedUrls[0];
              });
        }
        results[i] = {
          username: element.username,
          followers: element.followers,
          follows: element.follows,
          avatar: url,
        };
      }
      return res.json(results);
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};


module.exports = {
  registerUser,
  loginUser,
  tokenValidUser,
  getUserData,
  editUserData,
  getUserInformation,
  getEditUserData,
  findUsersPaginated,
  passwordResetRequest,
  getUserNotifications,
  getUserNotificationNumber,
  getRecommendedUsers,
  deleteUserNotification,
};
