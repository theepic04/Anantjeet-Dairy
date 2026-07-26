const db = require("../config/db");

exports.getDashboardStats = (req, res) => {

    const stats = {};

    db.query(
        "SELECT COUNT(*) AS visitors FROM visitors",
        (err, visitorsResult) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            stats.visitors = visitorsResult[0].visitors;

            db.query(
                "SELECT COUNT(*) AS products FROM products",
                (err, productsResult) => {

                    if (err) {
                        return res.status(500).json({
                            success: false,
                            message: "Database Error"
                        });
                    }

                    stats.products = productsResult[0].products;

                    db.query(

                        `SELECT COUNT(*) AS orders
                         FROM orders
                         WHERE MONTH(order_datetime)=MONTH(CURDATE())
                         AND YEAR(order_datetime)=YEAR(CURDATE());`,

                        (err, ordersResult) => {

                            if (err) {
                                return res.status(500).json({
                                    success: false,
                                    message: "Database Error"
                                });
                            }

                            stats.orders = ordersResult[0].orders;

                            db.query(

                                `SELECT IFNULL(SUM(total_amount),0) AS revenue
                                 FROM orders
                                 WHERE MONTH(order_datetime)=MONTH(CURDATE())
                                 AND YEAR(order_datetime)=YEAR(CURDATE());`,

                                (err, revenueResult) => {

                                    if (err) {
                                        return res.status(500).json({
                                            success: false,
                                            message: "Database Error"
                                        });
                                    }

                                    stats.revenue =
                                        revenueResult[0].revenue;

                                    res.json({

                                        success: true,

                                        stats

                                    });

                                }

                            );

                        }

                    );

                }

            );

        }

    );

};