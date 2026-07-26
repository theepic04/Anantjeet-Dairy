const db = require("../config/db");

// =========================
// GET SETTINGS
// =========================

exports.getSettings = (req, res) => {

    const sql = `
        SELECT *
        FROM settings
        LIMIT 1
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
            settings: result[0]

        });

    });

};

// =========================
// UPDATE SETTINGS
// =========================

exports.updateSettings = (req, res) => {

    const {

        store_name,
        support_email,
        delivery_city,
        opening_days,
        store_address,
        facebook_link,
        instagram_link,
        morning_open,
        morning_close,
        evening_open,
        evening_close

    } = req.body;

    const sql = `

        UPDATE settings

        SET

        store_name=?,
        support_email=?,
        delivery_city=?,
        opening_days=?,
        store_address=?,
        facebook_link=?,
        instagram_link=?,
        morning_open=?,
        morning_close=?,
        evening_open=?,
        evening_close=?,
        updated_at=NOW()

        WHERE id=1

    `;

    db.query(

        sql,

        [

            store_name,
            support_email,
            delivery_city,
            opening_days,
            store_address,
            facebook_link,
            instagram_link,
            morning_open,
            morning_close,
            evening_open,
            evening_close

        ],

        (err) => {

            if (err) {

                return res.status(500).json({

                    success:false,
                    message:"Database Error",
                    error:err

                });

            }

            res.json({

                success:true,
                message:"Settings Updated Successfully."

            });

        }

    );

};