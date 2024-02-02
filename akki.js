const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

const firebaseConfig = {
        "type": "service_account",
        "project_id": "geeknomix-db17a",
        "private_key_id": "6fe66fa88f2bcb80eea0b86a324eb7cdef7d44bb",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDUfcp5xWfdFSHl\nvjldv3+LNYmKddJSKhPXwrKKxhJdLxDRmrfAU9+Axes0Xh8fQuyWb2JG33slq9I0\nnvyPQyGzE57DZB3L9AeKtdD7Zvu6mrJnd65f32xEp8R9a7Vzrsc12UztIk4fqNFl\n3IrCkVsCXKb3dlmsQxTYqoo/0ewfdHW59lNJrWGYfnZccAVElRlpSQnMmQcgeAKq\nJt5wjEXV0z1kqdccJX2VRBx2t8IAmEGEoEnflXGyXBXcCjZL9bdwNiY3JItrz8hj\ni+QznI20OeT1ua5JKROnfxPjZPIDUPMdO0bul0PHwDpXHsR9G9Ho+8w0BgaXeQKV\nf+N9XU4tAgMBAAECggEABUNwHwIzkuwmJ5ahKwAYsVT+hIrZTn1J59M2TEBp6VKP\noeBgTB7MT2qgxsnxM42teLlUloJn7EkHxgEx4aG4tXmlAy65LfBZ3guDUwyXfhwq\nt5CuSkipbD/v49aTYiAd+Gi2VL0bTG/j3RhHV+ri0QLNzfiy34KNlWyiS+UdoURc\nCOQnaZMbri7gwujSGA3hQZi30cgJvpYBNYULtYQNBq+BJcqZ0nHzY1cDxyhYLAkJ\nT4nvixWEygSK5PyjDqFo2h21mix7UkVeSAskC1iIMnD3iAcI2WJWquZvHmVFuFXk\nhb3KTjLwG59SEST2WnPyKq0pKmq1564pSZJfHI1YkQKBgQDrriHoOD/2xlLM37I1\nITnSNFze1bXQplcl69qv8HdWNydsm9DPTdRlxU81SAwZ3GDlNs0KTusHUrr/DC+2\n8HE05Ob6AD7zK4RVszsZviCrILqT8GpvqnAxpkPeG2QJNQuVmRR13hdZt1HoEFWC\n/wetqLlv++rFLtl1WOuN/huhRQKBgQDmz9dMjSB88bCNxvhuWfJZTPbZJE3ymjP/\nosL7cQl2ZygbmW5/ulj1i8pIlCE8dstoJz2OufBf4YI9PZKOytABQvvczzhDUyS8\ndc+IReGDvIG4VhXlVK0MHhi0fvBjoqk14Q3QbJFwHtOXBAqiG2n6XOiZRRGHYy74\nxbqgKvZjyQKBgFgF0Fon8BPd3HzyK1/Wif7tWaZMUTydc70RCrtdZ2TG8q2IwIM8\ngVCFUeEHiKV7/qB9SDVKZlN03ax2Q7fis5VazL2gq+IsZZ+QcklaDl97uNOaHlaY\nZJDWlVB2EHWz3yC/bLnc+gGjCy9OMnHbiGWet6uQfg2pQsSmMkv1FSK1AoGALK9w\nb1GjSI1CMTCkSDkBwmg0IjX1IVLZXlSUizmHK3UtPqqlyfS55E/8CbEj/iDBoJh4\nQnmdH/L41AJnrV12h8gAGu/DZMVkB1iHpUpiLq8ALj/8XTnXhtEM12T8BU4olFXN\n5tweDCbrsAEITfogumfiYEoO6rc5ENC3IOswaIECgYAwb0UGTvx55cYeOgeqll9O\n+CKK1y+UEwVoR2JpSlZ7wOSKwQaGkGOoO4XRsQnzGpNS7JB7nANA4gqLcjeseUvQ\nfP6EqEGxwTjg43h8y0TQeSCH7QuJgx/yWSbaUO0aulysgOqmKOfE1CzZYOe+IKBz\nH2CsUUYQl+bcooCnBqYtqA==\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk-wk08f@geeknomix-db17a.iam.gserviceaccount.com",
        "client_id": "112016184703821802536",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-wk08f%40geeknomix-db17a.iam.gserviceaccount.com",
        "universe_domain": "googleapis.com"
  };

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: "https://geeknomix-db17a-default-rtdb.firebaseio.com"
  });

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// CRUD operations

// Create a new driver
app.post('/drivers', (req, res) => {
  const newDriver = req.body;
  const driversRef = admin.database().ref('drivers');
  const newDriverRef = driversRef.push();
  newDriverRef.set(newDriver)
    .then(() => res.status(201).json({ message: 'Driver added successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Read all drivers
app.get('/getAlldrivers', (req, res) => {
  const driversRef = admin.database().ref('drivers');
  driversRef.once('value')
    .then(snapshot => res.json(snapshot.val()))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Update a driver
app.put('/drivers/:id', (req, res) => {
  const driverId = req.params.id;
  const updatedDriver = req.body;
  const driversRef = admin.database().ref('drivers');

  driversRef.child(driverId).update(updatedDriver)
    .then(() => res.json({ message: 'Driver updated successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Delete a driver
app.delete('/drivers/:id', (req, res) => {
  const driverId = req.params.id;
  const driversRef = admin.database().ref('drivers');

  driversRef.child(driverId).remove()
    .then(() => res.json({ message: 'Driver deleted successfully' }))
    .catch(error => res.status(500).json({ error: error.message }));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
