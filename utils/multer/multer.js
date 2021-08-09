const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/files/images/avatars");
  },
  filename: function (req, file, callback) {
    let ext = file.originalname.split(".").pop();
    callback(null, uuidv4() + "." + ext);
  },
});

const uploader = multer({ storage: storage });

module.exports = uploader;
