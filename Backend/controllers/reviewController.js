const db = require("../config/db");

// ===========================
// GET ALL REVIEWS
// ===========================

exports.getReviews = (req, res) => {

    const sql = `
        SELECT *
        FROM reviews
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Database Error",
                error: err
            });

        }

        res.json({
            success: true,
            reviews: result
        });

    });

};

// ===========================
// ADD REVIEW
// ===========================

exports.addReview = (req, res) => {

    const {

        customer_name,
        rating,
        comment

    } = req.body;

    if (
        !customer_name ||
        !rating ||
        !comment
    ) {

        return res.status(400).json({
            success: false,
            message: "All fields are required."
        });

    }

    const sql = `
        INSERT INTO reviews
        (customer_name, rating, comment)
        VALUES (?, ?, ?)
    `;

    db.query(

        sql,

        [
            customer_name,
            rating,
            comment
        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({
                    success: false,
                    message: "Database Error",
                    error: err
                });

            }

            res.json({

                success: true,
                message: "Review Added Successfully."

            });

        }

    );

};