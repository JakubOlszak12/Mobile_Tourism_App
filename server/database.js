const admin = require('firebase-admin');
const serviceAccount = require(''); // your service account json

const db = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: '',  // your storage bucket 
});

module.exports = db;
