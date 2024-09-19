const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/secret.js");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    console.log("token", token);
    if (!token)
      return res
        .status(401)
        .json({ message: "No token, authorization denied." });

    const verified = jwt.verify(token, jwtSecret);
    if (!verified)
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied." });

    console.log("verified", verified);

    req.id = verified.userId;
    req.email = verified.email;

    next();
  } catch (err) {
    console.error("Error in authentication:", err);
    console.log("Error in authentication:", err);
    res.status(500).json({
      error: err.message,
    });
  }
};

module.exports = auth;
