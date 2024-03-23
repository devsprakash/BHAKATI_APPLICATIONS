
const multer = require('multer')


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/') // Specify the destination directory
  },
  filename: function (req, file, cb) {
      cb(null, file.originalname) // Keep the original filename
  }
});

const upload = multer({ storage: storage });
module.exports = upload
