/* eslint-disable max-len */
/* eslint-disable linebreak-style */
'use strict';

const firebase = require('../database');
const firestore = firebase.firestore();
const db_users = firestore.collection('User');
const db_achievements = firestore.collection('Achievement');


const getAchievements = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Problem z weryfikacją użytkownika. Spróbuj później lub zaloguj się ponownie.'});
    }
    const userAchivements = user.docs[0].data().achievements;
    for (let i = 0; i < userAchivements.length; i++) {
      const element = userAchivements[i];
      userAchivements[i] = element.achievementId;
    }

    const achievements = await db_achievements.get();
    const allAchievements = achievements.docs.map((doc) => doc.data());
    const achievementsArray = [];
    for (let i = 0; i < allAchievements.length; i++) {
      const element = allAchievements[i];
      achievementsArray.push({
        name: element.name,
        text: element.text,
        isAchieved: userAchivements.includes(achievements.docs[i].id) ? 1 : 0,
      });
    }

    return res.json(achievementsArray);
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
};

const getUserAchievements = async (req, res) => {
  try {
    const user = await db_users
        .where('username', '==', req.params.username)
        .get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Nie znaleziono użytkownika'});
    }
    if (user.docs[0].data().achievements.length === 0) {
      return res.json([]);
    }
    const userachievementsIds = user.docs[0]
        .data()
        .achievements.map((doc) => doc.achievementId);

    const userAchievements = await db_achievements
        .where('__name__', 'in', userachievementsIds)
        .get();
    const allUserAchievements = userAchievements.docs.map((doc) =>
      doc.data(),
    );
    for (let i = 0; i < user.docs[0].data().achievements.length; i++) {
      const element = user.docs[0].data().achievements[i];
      allUserAchievements[i] = {
        achievementId: element.achievementId,
        name: allUserAchievements[i].name,
        text: allUserAchievements[i].text,
        timestamp: element.date,
      };
    }
    return res.json(allUserAchievements);
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
};

const getAchievementsCount = async (req, res) => {
  try {
    const user = await db_users.where('__name__', '==', req.user).get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Problem z weryfikacją użytkownika. Spróbuj później lub zaloguj się ponownie.'});
    }
    const achievements = await db_achievements.get();
    if (!achievements.docs[0]) {
      return res.json({message: 'Błąd z wczytywaniem ilości osiągnięć'});
    }

    return res.json({
      achievementsCount: achievements.docs.map((doc) => doc.id).length,
    });
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
};

const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const getAvalancheDegree = async (req, res) => {
  try {
    const vgmUrl = 'https://lawiny.topr.pl';
    await JSDOM.fromURL(vgmUrl, {
      runScripts: 'dangerously',
      resources: 'usable',
    }).then((dom) => {
      setTimeout(() => {
        try {
          const text =
            dom.window.document.querySelector('.law-mst-lev').textContent;
          if (text === '') {
            return res.json('0');
          }
          return res.json(text);
        } catch (error) {
          return res.json('0');
        }
      }, 3000);
    });
  } catch (error) {
    return res.status(400).json({message: error.message});
  }
};

module.exports = {
  getAchievements,
  getUserAchievements,
  getAchievementsCount,
  getAvalancheDegree,
};
