const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

const requireAdmin = require("../middleware/authMiddleware");


router.post(
    "/add",
    requireAdmin,
    orderController.addOrder
);
router.get(
    "/",
    requireAdmin,
    orderController.getOrders
);
router.put(
    "/:id",
    requireAdmin,
    orderController.updateOrder
);
router.delete(
    "/:id",
    requireAdmin,
    orderController.deleteOrder
);
router.get(
    "/:id/invoice",
    requireAdmin,
    orderController.getInvoice
);

module.exports = router;