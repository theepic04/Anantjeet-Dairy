const express = require("express");

const router = express.Router();

const reviewController =
require("../controllers/reviewController");

// Get All Reviews
router.get(
    "/",
    reviewController.getReviews
);

// Add Review
router.post(
    "/add",
    reviewController.addReview
);

module.exports = router;