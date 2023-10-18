/* eslint-disable new-cap */
const express = require('express');
const {registerUser} = require('../controllers/userController');
const {loginUser} = require('../controllers/userController');
const {tokenValidUser} = require('../controllers/userController');
const {getUserData} = require('../controllers/userController');
const middleware = require('../middleware');
const multer = require('multer');

const {
  editUserData,
  getUserInformation,
  getEditUserData,
  findUsersPaginated,
  passwordResetRequest,
  getUserNotifications,
  getUserNotificationNumber,
  getRecommendedUsers,
  deleteUserNotification,
} = require('../controllers/userController');
const router = express.Router();
const {
  addMessage,
  readMessages,
} = require('../controllers/messageController');
const {
  followUser,
  findFollowers,
  findFollows,
} = require('../controllers/followController');
const {
  addRoute,
  getRoutes,
  getRouteInfo,
  finishRoute,
  deleteRoute,
  editRoute,
} = require('../controllers/routeController');

const {
  getAchievements,
  getUserAchievements,
  getAchievementsCount,
  getAvalancheDegree,
} = require('../controllers/achievementController');

const {
  addPost,
  getPosts,
  getUserPosts,
  deletePost,
  editPost,
  getEditData,
} = require('../controllers/postController');

const DIR = './public/';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DIR);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});


const upload = multer({
  storage: storage, // firebase.storage().bucket(firebaseConfig.storageBucket),
  fileFilter: (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length']);
    if ((file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') && fileSize < 10000000) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb('Tylko .png, .jpg, .jpeg poniżej 10MB!');
    }
  },
}).single('image');

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.post('/user/tokenValid', tokenValidUser);
router.get('/user/', middleware, getUserData);
router.patch('/user/edit', upload, middleware, editUserData);
router.get('/userinfo/:username', middleware, getUserInformation);
router.get('/user/follow/:username', middleware, followUser);
router.get('/user/followers/:username', middleware, findFollowers);
router.get('/user/follows/:username', middleware, findFollows);
router.get('/user/editData', middleware, getEditUserData);
router.get('/user/finduser/:username/:startingPoint', middleware, findUsersPaginated); // starting point to nazwa użytkownika z poprzedniego requesta. przy pierwszym wywołaniu należy podać nazwę wpisaną w wyszukiwarkę
router.get('/user/getNotifications', middleware, getUserNotifications);
router.get('/user/getNotificationNumber', middleware, getUserNotificationNumber);
router.get('/user/getRecommendedUsers', middleware, getRecommendedUsers);
router.delete('/user/deleteNotification/:id', middleware, deleteUserNotification);

router.post('/user/sendNewMessage/:username', middleware, addMessage);
router.get('/user/readMessages/:username', middleware, readMessages);

router.post('/routes/addRoute', middleware, addRoute);
router.get('/routes/getRoutes', middleware, getRoutes);
router.get('/routes/getRouteInfo/:id', middleware, getRouteInfo);
router.post('/routes/finishRoute/:id', middleware, finishRoute);
router.delete('/routes/deleteRoute/:id', middleware, deleteRoute);
router.put('/routes/editRoute/:id', middleware, editRoute);

router.get('/achievements', middleware, getAchievements);
router.get('/user/achievements/:username', middleware, getUserAchievements);
router.get('/achievementsCount', middleware, getAchievementsCount);

router.get('/avalancheDegree', middleware, getAvalancheDegree);

router.post('/user/passwordReset', passwordResetRequest);

router.post('/post/addPost', upload, middleware, addPost);
router.get('/post/getPosts/:lastId', middleware, getPosts);
router.get('/post/getUserPosts/:username/:lastId', middleware, getUserPosts);
router.delete('/post/deletePost/:id', middleware, deletePost);
router.put('/post/edit/:id', upload, middleware, editPost);
router.get('/post/getEditData/:id', middleware, getEditData);
module.exports = {
  routes: router,
};

