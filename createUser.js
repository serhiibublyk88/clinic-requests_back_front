const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const chalk = require("chalk");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(chalk.bgGreen("MongoDB connected!"));
    return createUser();
  })
  .catch((err) => {
    console.error(chalk.red("MongoDB connection error:"), err);
  });

const User = require("./models/User");

async function createUser() {
  const username = "anton";
  const email = "anton@anton.anton";
  const password = "anton";

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
  });

  try {
    const savedUser = await newUser.save();
    console.log("User created successfully:", savedUser);
  } catch (error) {
    console.error(chalk.red("Error creating user:"), error);
  }
}
