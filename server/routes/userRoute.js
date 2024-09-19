const express = require("express");
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const upload = require("../config/multer");

const router = express.Router();

router.post("/register", authController.signup);
router.post("/login", authController.login);
router.get("/", auth, authController.getSingleUser);
router.post("/updateProfile", auth, authController.updateProfile);
router.post(
  "/updateProfileImage",
  auth,
  upload,
  authController.updateProfileImage
);
router.delete("/removeProfileImage", auth, authController.removeProfileImage);
module.exports = router;
