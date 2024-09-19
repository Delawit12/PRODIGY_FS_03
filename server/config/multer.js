const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "profileImage") {
      cb(null, "uploads/profiles"); // Destination folder for profile picture uploads
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // File naming
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 9000000 },
  fileFilter: function (req, file, cb) {
    // checkFileType(file, cb);
    // Allow all file types for now
    cb(null, true);
  },
}).single("profileImage");
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

module.exports = upload;
