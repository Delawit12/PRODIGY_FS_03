const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "provide email"],
      unique: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "provide password"],
    },
    profilePic: {
      type: String,
      default: "",
    },
    color: {
      type: Number,
    },
    profileSetup: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// for checking the correctness of customer password for logging them in .
userSchema.methods.correctPassword = async function (
  candidatePassword,
  password
) {
  return await bcrypt.compare(candidatePassword, password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
