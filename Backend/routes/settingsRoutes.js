const express = require("express");

const router = express.Router();

const settingsController =
require("../controllers/settingsController");

const requireAdmin = require("../middleware/authMiddleware");

// Get Settings
router.get(
    "/",
    settingsController.getSettings
);

// Update Settings
router.put(
    "/",
    requireAdmin,
    settingsController.updateSettings
);

module.exports = router;