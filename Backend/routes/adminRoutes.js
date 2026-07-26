const express = require("express");
const router = express.Router();

const { loginAdmin, logoutAdmin } = require("../controllers/adminController");

const requireAdmin = require("../middleware/authMiddleware");

router.post("/login", loginAdmin);
router.post("/logout", requireAdmin, logoutAdmin);

module.exports = router;