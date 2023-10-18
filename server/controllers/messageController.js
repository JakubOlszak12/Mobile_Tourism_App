'use strict';


const firebase = require('../database');

const firestore = firebase.firestore();

const db_users = firestore.collection('User');

const db_message = firestore.collection('Message');

const Message = require('../models/Messages');


// eslint-disable-next-line require-jsdoc
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

const addMessage = async (req, res) => {
  try {
    if (req.body.text.length > 255) {
      return res.status(400).json({message: 'Wiadomość nie może być dłusza niż 255 znaków'});
    }
    const chatter = await db_users
        .where('username', '==', req.params.username)
        .get();
    const user = await db_users.where('__name__', '==', req.user).get();
    if (!user.docs[0]) {
      return res.status(400).json({message: 'Problem z weryfikacją. Zaloguj się ponownie w razie występowania błędu'});
    }
    let messageRef = await db_message
        .where('sender', '==', user.docs[0].id)
        .where('receiver', '==', chatter.docs[0].id)
        .get();
    if (messageRef.docs[0]) {
      const messageArray = messageRef.docs[0].data().messages;
      messageArray.push({
        sender: user.docs[0].id,
        text: req.body.text,
        timestamp: new Date(),
      });
      await db_message.doc(messageRef.docs[0].id).update({
        messages: messageArray,
      });

      addNotification('Dostałeś wiadomość od: '+ user.docs[0].data().username,
          chatter, user, 'message',
      );
      return res.json(
          'Wysłano wiadomość do ' + chatter.docs[0].data().username,
      );
    }
    if (!messageRef.docs[0]) {
      messageRef = await db_message
          .where('sender', '==', chatter.docs[0].id)
          .where('receiver', '==', user.docs[0].id)
          .get();
      if (messageRef.docs[0]) {
        const messageArray = messageRef.docs[0].data().messages;
        messageArray.push({
          sender: user.docs[0].id,
          text: req.body.text,
          timestamp: new Date(),
        });
        await db_message.doc(messageRef.docs[0].id).update({
          messages: messageArray,
        });

        addNotification('Dostałeś wiadomość od: '+user.docs[0].data().username,
            chatter, user, 'message',
        );
        return res.json(
            'Wysłano wiadomość do ' + chatter.docs[0].data().username,
        );
      }
    }
    // Jeżeli nie ma korespondencji, stwórz nową
    const newMess = new Message(user.docs[0].id, chatter.docs[0].id, [
      {
        sender: user.docs[0].id,
        text: req.body.text,
        timestamp: new Date(),
      },
    ]);
    await db_message.doc().set(Object.assign({}, newMess));
    addNotification('Dostałeś wiadomość od: '+user.docs[0].data().username,
        chatter, user, 'message',
    );
    res.json('Wysłano wiadomość do ' + chatter.docs[0].data().username);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

const readMessages = async (req, res) => {
  try {
    const chatter = await db_users
        .where('username', '==', req.params.username)
        .get();

    let messageRef = await db_message
        .where('sender', '==', req.user)
        .where('receiver', '==', chatter.docs[0].id)
        .get();
    if (!messageRef.docs[0]) {
      messageRef = await db_message
          .where('sender', '==', chatter.docs[0].id)
          .where('receiver', '==', req.user)
          .get();
    }
    if (messageRef.docs[0]) {
      const messageArray = messageRef.docs[0].data().messages;
      for (let i = 0; i<messageArray.length; i++) {
        let isMine = 0;
        if (messageArray[i].sender === req.user) {
          isMine = 1;
        }
        messageArray[i] = {
          sender: messageArray[i].sender,
          text: messageArray[i].text,
          timestamp: messageArray[i].timestamp,
          isMine: isMine,
        };
      }
      return res.json(messageArray);
    // db_message.doc(messageRef.docs[0].id)
    // .onSnapshot((doc) => {
    //     console.log("Current data: ", doc.data());
    // });
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(400).json({message: error.message});
  }
};

module.exports = {
  addMessage,
  readMessages,
};
