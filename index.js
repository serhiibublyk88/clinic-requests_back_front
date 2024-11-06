const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const chalk = require("chalk");
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(chalk.bgGreen("MongoDB connected!"));
  })
  .catch((err) => {
    console.error(chalk.red("MongoDB connection error:"), err);
  });

const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");

app.use("/auth", authRoutes);
app.use("/requests", requestRoutes);
app.use(errorHandler);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/requests/allRequests", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const requests = await Request.find({
      $or: [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ],
    })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalRequests = await Request.countDocuments({
      $or: [
        { name: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ],
    });

    const totalPages = Math.ceil(totalRequests / limit);

    res.render("allRequests", {
      requests,
      currentPage: Number(page),
      totalPages,
      limit,
      search,
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.bgGreen(`Server is running on port ${PORT}`));
});
