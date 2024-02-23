
const multer = require('multer')


let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, '-' + Date.now() + file.originalname)
    }
  })
  
  exports.upload = multer({ storage: storage });
  
  