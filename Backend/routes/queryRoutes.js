const express = require("express");

const router = express.Router();

const queryController =
require("../controllers/queryController");

const requireAdmin = require("../middleware/authMiddleware");

router.post(
    "/add",
    queryController.addQuery
);

router.get(
    "/",
    requireAdmin,
    queryController.getQueries
);

router.delete(
    "/:id",
    requireAdmin,
    queryController.deleteQuery
);

module.exports = router;