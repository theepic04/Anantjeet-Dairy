const express = require("express");

const router = express.Router();

const requireAdmin = require("../middleware/authMiddleware");

const adminProfileController =
require("../controllers/adminProfileController");

// Get Admin Profile
router.get(
    "/profile",
    requireAdmin,
    adminProfileController.getProfile
);

// Update Admin Profile
router.put(
    "/profile",
    requireAdmin,
    adminProfileController.updateProfile
);

module.exports = router;