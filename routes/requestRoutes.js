//requestRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middlewares/authMiddleware");
const Request = require("../models/Request");

const getUserData = (req) => {
  return { user: req.user || null };
};

router.get("/", (req, res) => {
  res.render("index", { isLoginPage: false, ...getUserData(req) });
});

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  requestController.createRequest
);

router.get("/allRequests", authMiddleware, async (req, res) => {
  try {
    const {
      search,
      status,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [{ name: regex }, { phone: regex }, { description: regex }];
    }

    const sort = {};
    if (sortBy) sort[sortBy] = order === "asc" ? 1 : -1;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const requests = await Request.find(filter)
      .sort(sort)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalRequests = await Request.countDocuments(filter);

    res.render("allRequests", {
      requests,
      user: req.user,
      totalRequests,
      totalPages: Math.ceil(totalRequests / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber,
      search: search || "",
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Error fetching requests." });
  }
});

router.get("/all", authMiddleware, requestController.getAllRequests);

router.delete("/:id", authMiddleware, requestController.deleteRequest);

router.put("/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    res.json(request);
  } catch (error) {
    console.error("Error updating request status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
