const db = require("../config/db");

// ============================
// Add Query
// ============================

exports.addQuery = (req, res) => {

    const {
        name,
        gender,
        phone,
        email,
        address,
        message
    } = req.body;

    const sql = `
        INSERT INTO contact_messages
        (
            name,
            gender,
            phone,
            email,
            address,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            gender,
            phone,
            email,
            address,
            message
        ],
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
                message: "Query submitted successfully."
            });

        }
    );

};


// ============================
// Get All Queries
// ============================

exports.getQueries = (req, res) => {

    db.query(

        `SELECT *
         FROM contact_messages
         ORDER BY created_at DESC`,

        (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            res.json({

                success: true,

                queries: results

            });

        }

    );

};


// ============================
// Delete Query
// ============================

exports.deleteQuery = (req, res) => {

    const { id } = req.params;

    db.query(

        "DELETE FROM contact_messages WHERE id=?",

        [id],

        (err, result) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message: "Query not found."

                });

            }

            res.json({

                success: true,

                message: "Query deleted successfully."

            });

        }

    );

};