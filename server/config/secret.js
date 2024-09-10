require("dotenv").config();
module.exports = {
  mongoURI: process.env.mongoURI,
  // mongoLocal: process.env.DB_LOCAL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  EMAIL: process.env.EMAIL,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
};
