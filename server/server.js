const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const cookiesParser = require("cookie-parser");
const globalErrorHandler = require("./ErrorHandler/errorController");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookiesParser());

const PORT = process.env.PORT || 8080;

// Global error handler for handling errors globally.
app.use(globalErrorHandler);

app.get("/", (request, response) => {
  response.json({
    message: "Server running at " + PORT,
  });
});

const userRoute = require("./routes/userRoute");

//api endpoints
app.use("/api/user/", userRoute);

connectDB();

app.listen(PORT, () => {
  console.log("server running at " + PORT);
});

// The error handler for all asynchronous codes.
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message),
    console.log("Unhandled error happened and shutting down ....");
  process.exit(1);
});
