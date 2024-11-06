//requestController.js
const { validationResult } = require("express-validator");
const Request = require("../models/Request");

exports.createRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phone, description } = req.body;
    const newRequest = new Request({
      name,
      phone,
      description,
    });

    await newRequest.save();

    res
      .status(201)
      .json({ message: "Request created successfully", request: newRequest });
  } catch (error) {
    next(error);
  }
};

exports.getAllRequests = async (req, res, next) => {
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
      currentPage: pageNumber,
      totalPages: Math.ceil(totalRequests / limitNumber),
      limit: limitNumber,
      search: search || "",
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedRequest = await Request.findByIdAndDelete(id);
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { status: "completed" },
      { new: true }
    );
    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }
    res.status(200).json({
      message: "Status updated successfully",
      request: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
};

exports.renderRequestForm = (req, res) => {
  res.render("index", { isLoginPage: false });
};
