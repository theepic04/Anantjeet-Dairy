const db = require("../models/orderModel");

// Add Order
// Add Order
exports.addOrder = (req, res) => {

    const { customer_name, order_datetime, items } = req.body;

    if (!customer_name || !order_datetime || !items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    db.query(
        "SELECT order_number FROM orders ORDER BY id DESC LIMIT 1",
        (err, lastOrder) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            let orderNumber = "#AD-1001";

            if (lastOrder.length > 0) {
                const lastNumber = parseInt(
                    lastOrder[0].order_number.replace("#AD-", "")
                );
                orderNumber = "#AD-" + (lastNumber + 1);
            }

            let totalAmount = 0;
            let orderItems = [];
            let processed = 0;

            items.forEach((item) => {

                db.query(
                    "SELECT price FROM products WHERE id = ?",
                    [item.product_id],
                    (err, product) => {

                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: "Database Error"
                            });
                        }

                        if (product.length === 0) {
                            return res.status(404).json({
                                success: false,
                                message: "Product not found."
                            });
                        }

                        const price = product[0].price;
                        const subtotal = price * item.quantity;

                        totalAmount += subtotal;

                        orderItems.push({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price: price,
                            subtotal: subtotal
                        });

                        processed++;

                        if (processed === items.length) {

                            db.query(
                                `INSERT INTO orders
                                (order_number, customer_name, order_datetime, total_amount)
                                VALUES (?, ?, ?, ?)`,
                                [
                                    orderNumber,
                                    customer_name,
                                    order_datetime,
                                    totalAmount
                                ],
                                (err, result) => {

                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({
                                            success: false,
                                            message: "Database Error"
                                        });
                                    }

                                    const orderId = result.insertId;

                                    let inserted = 0;

                                    orderItems.forEach((orderItem) => {

                                        db.query(
                                            `INSERT INTO order_items
                                            (order_id, product_id, quantity, price, subtotal)
                                            VALUES (?, ?, ?, ?, ?)`,
                                            [
                                                orderId,
                                                orderItem.product_id,
                                                orderItem.quantity,
                                                orderItem.price,
                                                orderItem.subtotal
                                            ],
                                            (err) => {

                                                if (err) {
                                                    console.error(err);
                                                    return res.status(500).json({
                                                        success: false,
                                                        message: "Database Error"
                                                    });
                                                }

                                                inserted++;

                                                if (inserted === orderItems.length) {

                                                    res.status(201).json({
                                                        success: true,
                                                        message: "Order added successfully.",
                                                        orderId,
                                                        orderNumber
                                                    });

                                                }

                                            }
                                        );

                                    });

                                }
                            );

                        }

                    }
                );

            });

        }
    );

};

// Get Orders
// Get Orders
exports.getOrders = (req, res) => {

    const sql = `
        SELECT *
        FROM orders
        ORDER BY order_datetime DESC
    `;

    db.query(sql, (err, orders) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (orders.length === 0) {
            return res.status(200).json({
                success: true,
                orders: []
            });
        }

        let completed = 0;

        orders.forEach((order) => {

            const itemSql = `
                SELECT
                    oi.id,
                    oi.product_id,
                    p.product_name,
                    oi.quantity,
                    oi.price,
                    oi.subtotal
                FROM order_items oi
                JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;

            db.query(itemSql, [order.id], (err, items) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });
                }

                order.items = items;

                completed++;

                if (completed === orders.length) {

                    res.status(200).json({
                        success: true,
                        orders
                    });

                }

            });

        });

    });

};

// Update Order
// Update Order
exports.updateOrder = (req, res) => {

    const { id } = req.params;
    const { customer_name, order_datetime, items } = req.body;

    if (!customer_name || !order_datetime || !items || items.length === 0) {
        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });
    }

    db.query(
        "SELECT * FROM orders WHERE id = ?",
        [id],
        (err, order) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (order.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            let totalAmount = 0;
            let orderItems = [];
            let processed = 0;

            items.forEach((item) => {

                db.query(
                    "SELECT price FROM products WHERE id = ?",
                    [item.product_id],
                    (err, product) => {

                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: "Database Error"
                            });
                        }

                        if (product.length === 0) {
                            return res.status(404).json({
                                success: false,
                                message: "Product not found."
                            });
                        }

                        const price = product[0].price;
                        const subtotal = price * item.quantity;

                        totalAmount += subtotal;

                        orderItems.push({
                            product_id: item.product_id,
                            quantity: item.quantity,
                            price,
                            subtotal
                        });

                        processed++;

                        if (processed === items.length) {

                            db.query(
                                `UPDATE orders
                                 SET customer_name=?,
                                     order_datetime=?,
                                     total_amount=?
                                 WHERE id=?`,
                                [
                                    customer_name,
                                    order_datetime,
                                    totalAmount,
                                    id
                                ],
                                (err) => {

                                    if (err) {
                                        console.error(err);
                                        return res.status(500).json({
                                            success: false,
                                            message: "Database Error"
                                        });
                                    }

                                    db.query(
                                        "DELETE FROM order_items WHERE order_id=?",
                                        [id],
                                        (err) => {

                                            if (err) {
                                                console.error(err);
                                                return res.status(500).json({
                                                    success: false,
                                                    message: "Database Error"
                                                });
                                            }

                                            let inserted = 0;

                                            orderItems.forEach((orderItem) => {

                                                db.query(
                                                    `INSERT INTO order_items
                                                    (order_id, product_id, quantity, price, subtotal)
                                                    VALUES (?, ?, ?, ?, ?)`,
                                                    [
                                                        id,
                                                        orderItem.product_id,
                                                        orderItem.quantity,
                                                        orderItem.price,
                                                        orderItem.subtotal
                                                    ],
                                                    (err) => {

                                                        if (err) {
                                                            console.error(err);
                                                            return res.status(500).json({
                                                                success: false,
                                                                message: "Database Error"
                                                            });
                                                        }

                                                        inserted++;

                                                        if (inserted === orderItems.length) {

                                                            res.json({
                                                                success: true,
                                                                message: "Order updated successfully."
                                                            });

                                                        }

                                                    }
                                                );

                                            });

                                        }
                                    );

                                }
                            );

                        }

                    }
                );

            });

        }
    );

};
// Delete Order
// Delete Order
exports.deleteOrder = (req, res) => {

    const { id } = req.params;

    db.query(
        "SELECT * FROM orders WHERE id = ?",
        [id],
        (err, order) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (order.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            db.query(
                "DELETE FROM order_items WHERE order_id = ?",
                [id],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.status(500).json({
                            success: false,
                            message: "Database Error"
                        });
                    }

                    db.query(
                        "DELETE FROM orders WHERE id = ?",
                        [id],
                        (err) => {

                            if (err) {
                                console.error(err);
                                return res.status(500).json({
                                    success: false,
                                    message: "Database Error"
                                });
                            }

                            res.json({
                                success: true,
                                message: "Order deleted successfully."
                            });

                        }
                    );

                }
            );

        }
    );

};

// Generate Invoice
// Generate Invoice
exports.getInvoice = (req, res) => {

    const { id } = req.params;

    db.query(
        "SELECT * FROM orders WHERE id = ?",
        [id],
        (err, orders) => {

            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (orders.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Order not found."
                });
            }

            const order = orders[0];

            const sql = `
                SELECT
                    oi.product_id,
                    p.product_name,
                    oi.quantity,
                    oi.price,
                    oi.subtotal
                FROM order_items oi
                JOIN products p
                    ON oi.product_id = p.id
                WHERE oi.order_id = ?
            `;

            db.query(sql, [id], (err, items) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });
                }

                order.items = items;

                res.json({
                    success: true,
                    invoice: order
                });

            });

        }
    );

};