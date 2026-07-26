const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

const requireAdmin = require("../middleware/authMiddleware");


const {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");


// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.post(
    "/add",
    requireAdmin,
    upload.single("image"),
    addProduct
);
router.get("/", getAllProducts);
router.put(
    "/:id",
    requireAdmin,
    upload.single("image"),
    updateProduct
);
router.delete(
    "/:id",
    requireAdmin,
    deleteProduct
);

module.exports = router;