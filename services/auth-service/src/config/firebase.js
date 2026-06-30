const admin = require('firebase-admin');

let firebaseApp;

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseApp;
}

function getAdmin() {
  if (!firebaseApp) initFirebase();
  return admin;
}

module.exports = { initFirebase, getAdmin };
