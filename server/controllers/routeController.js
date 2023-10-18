/* eslint-disable no-var */
/* eslint-disable require-jsdoc */
'use strict';

const firebase = require('../database');
const firestore = firebase.firestore();
const db_users = firestore.collection('User');
const db_routes = firestore.collection('Route');
const Route = require('../models/Route');
const db_achievements = firestore.collection('Achievement');
const Post = require('../models/Post');
const db_posts = firestore.collection('Post');
const addRoute = async (req, res, next) => {
  try {
    const {
      destinationName,
      originName,
      fullRouteName,
      origin,
      destination,
      elevation,
      duration,
      distance,
      elevationDestination,
    } = req.body;
    if (destinationName === undefined || originName === undefined) {
      return res.status(400).json({message: 'Nie podałeś punktu początkowego lub końcowego trasy'});
    }
    const user = await db_users.where('__name__', '==', req.user).get();
    const routeExists = await db_routes
        .where('origin', '==', origin)
        .where('destination', '==', destination)
        .where('userId', '==', req.user)
        .get();
    if (routeExists.docs[0]) {
      return res
          .status(400)
          .json({message: 'Trasa, którą próbujesz dodać już istnieje w twoim schowku!'});
    }
    const routes = await db_routes.where('userId', '==', req.user).get();
    const size = routes.docs.map((doc) => doc.data()).length;
    if (size === 5) {
      return res
          .status(400)
          .json(
              {message: 'Nie możesz mieć więcej niż 5 tras w jednym momencie! Usuń albo ukończ aktualne trasy aby dodać kolejną.'},
          );
    }
    const newRoute = new Route(
        user.docs[0].id,
        origin,
        destination,
        elevation,
        duration,
        distance,
        fullRouteName,
        elevationDestination,
        destinationName,
        originName,
    );
    await db_routes.doc().set(Object.assign({}, newRoute));
    res.json('Dodano pomyślnie trasę!');
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const getRoutes = async (req, res) => {
  try {
    const routes = await db_routes.where('userId', '==', req.user).get();
    if (!routes.docs[0]) {
      return res
          .json([]);
    } else {
      const allRoutes = routes.docs.map((doc) => doc.data()).length;
      const routesArray = [];
      for (let i = 0; i < allRoutes; i++) {
        const route = routes.docs[i];
        routesArray.push({
          duration: route.data().duration,
          elevation: route.data().elevation,
          distance: route.data().distance,
          routeId: route.id,
          fullRouteName: route.data().fullRouteName,
        });
      }
      return res.json(routesArray);
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const getRouteInfo = async (req, res) => {
  try {
    const route = await db_routes
        .where('__name__', '==', req.params.id)
        .where('userId', '==', req.user)
        .get();
    console.log(route.docs[0].data());
    if (!route.docs[0]) {
      return res.status(400).json({message: 'Problem z wczytaniem danych trasy, spróbuj ponownie później'});
    } else {
      return res.json(route.docs[0].data());
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

// Haversine formula to check whether user is in 25m radius from the destination point.
function haversineFormula(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}


async function addNotification(text, user, reference, type) {
  const currentUserNotifications = user.docs[0].data().notifications;
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

const finishRoute = async (req, res) => {
  try {
    const route = await db_routes
        .where('__name__', '==', req.params.id)
        .where('userId', '==', req.user)
        .get();

    const user = await db_users.where('__name__', '==', req.user).get();
    const {latitude, longitude, elevationDestination} = req.body; // latitude i longitude aktualnej pozycji użytkownika
    if (!route.docs[0]) {
      return res.status(400).json({message: 'Dana trasa nie istnieje!'});
    } else {
      if (
        haversineFormula(
            latitude,
            longitude,
            route.docs[0].data().destination.latitude,
            route.docs[0].data().destination.longitude,
        ) <= 25
      ) {
        if (Math.abs(route.docs[0].data().elevationDestination-elevationDestination) > 20) {
          return res
              .status(400)
              .json(
                  {message: 'Aktualna wysokość nie jest zgodna z punktem docelowym. Aby ukończyć trasę przejdź do punktu docelowego.'});
        }

        // await db_routes.doc(route.docs[0].id).delete();
        if (user.docs[0].data().achievements.length > 0) {
          const userachievementsIds = user.docs[0]
              .data()
              .achievements.map((doc) => doc.achievementId);

          var achievements = await db_achievements
              .where('__name__', 'not-in', userachievementsIds)
              .where('type', '==', 'RoutePoint')
              .get();
        } else {
          var achievements = await db_achievements
              .where('type', '==', 'RoutePoint')
              .get();
        }
        const array = achievements.docs.map((doc) => doc.data());
        for (let i = 0; i < array.length; i++) {
          for (let j = 0; j < array[i].coordinates.length; j++) {
            if (
              haversineFormula(
                  route.docs[0].data().destination.latitude,
                  route.docs[0].data().destination.longitude,
                  array[i].coordinates[j].latitude,
                  array[i].coordinates[j].longitude,
              ) <= 25
            ) {
              const idachievement = await db_achievements
                  .where('name', '==', array[i].name)
                  .get();
              if (!idachievement.docs[0]) {
                return res.status(400).json({message: 'Wystąpił błąd!'});
              } else {
                const userachievements = user.docs[0].data().achievements;
                userachievements.push({
                  achievementId: idachievement.docs[0].id,
                  date: new Date(),
                });

                await db_users.doc(user.docs[0].id).update({
                  achievements: userachievements,
                  finished_routes: user.docs[0].data().finished_routes + 1,
                });
                await db_routes.doc(route.docs[0].id).delete();
                addNotification('Otrzymałeś nowe osiągnięcie!', user, user, 'achievement');
                const newPost = new Post(
                    idachievement.docs[0].data().image,
                    idachievement.docs[0].data().text,
                    'achievement',
                    new Date(),
                    user.docs[0].id,
                    user.docs[0].data().username,
                    user.docs[0].data().avatar,
                );
                await db_posts.doc().set(Object.assign({}, newPost));
                return res.json('Ukończono trasę pomyślnie');
              }
            }
          }
        }
        await db_users.doc(req.user).update({
          finished_routes: user.docs[0].data().finished_routes + 1,
        });
        await db_routes.doc(route.docs[0].id).delete();
        return res.json('Pomyślnie ukończono trasę');
      } else {
        return res
            .status(400)
            .json({
              message:
              'Nie znajdujesz się w miejscu docelowym trasy. Aby ukończyć trasę musisz znajdować się w punkcie docelowym.',
            });
      }
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const deleteRoute = async (req, res) => {
  try {
    const route = await db_routes
        .where('__name__', '==', req.params.id)
        .where('userId', '==', req.user)
        .get();
    if (!route.docs[0]) {
      return res.status(400).json({message: 'Dana trasa nie istnieje!'});
    } else {
      await db_routes.doc(route.docs[0].id).delete();
      return res.json('Pomyślnie usunięto trasę');
    }
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};

const editRoute = async (req, res) => {
  try {
    const {
      destinationName,
      originName,
      fullRouteName,
      origin,
      destination,
      elevation,
      duration,
      distance,
      elevationDestination,
    } = req.body;
    if (destinationName === undefined || originName === undefined) {
      return res
          .status(400)
          .json({
            message: 'Nie podałeś punktu początkowego lub końcowego trasy',
          });
    }
    const routeExists = await db_routes
        .where('__name__', '==', req.params.id)
        .get();
    if (!routeExists.docs[0]) {
      return res
          .status(400)
          .json({message: 'Nie znaleziono trasy, spróbuj ponownie później.'});
    }
    await db_routes.doc(routeExists.docs[0].id).update({
      fullRouteName: fullRouteName,
      origin: origin,
      destination: destination,
      distance: distance,
      duration: duration,
      elevation: elevation,
      elevationDestination: elevationDestination,
      destinationName: destinationName,
      originName: originName,
    });
    res.json('Pomyślnie edytowano trasę.');
  } catch (err) {
    res.status(400).json({message: err.message});
  }
};
module.exports = {
  addRoute,
  getRoutes,
  getRouteInfo,
  finishRoute,
  deleteRoute,
  editRoute,
};
