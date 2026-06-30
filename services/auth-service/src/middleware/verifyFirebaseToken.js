const { getAdmin } = require('../config/firebase');

async function verifyFirebaseToken(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Firebase idToken is required', code: 'MISSING_ID_TOKEN' });
    }
    const admin = getAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.firebaseUser = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid Firebase token', code: 'INVALID_FIREBASE_TOKEN' });
  }
}

module.exports = verifyFirebaseToken;
