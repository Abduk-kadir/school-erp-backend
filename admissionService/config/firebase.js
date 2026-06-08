const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'demoprojectabdul-firebase-adminsdk-fbsvc-9880dfe980.json'),
    'utf8'
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const messaging = admin.messaging();
module.exports = {messaging};