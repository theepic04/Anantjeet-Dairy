const db = require("../config/db");
const bcrypt = require("bcrypt");

// ============================
// GET ADMIN PROFILE
// ============================

exports.getProfile = (req, res) => {

    db.query(

        "SELECT id, name, username FROM admins LIMIT 1",

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
                admin: result[0]

            });

        }

    );

};

// ============================
// UPDATE ADMIN PROFILE
// ============================

exports.updateProfile = async (req, res) => {

    const {

        name,
        username,
        password

    } = req.body;

    try {

        // Update only name & username
        if (!password) {

            db.query(

                `UPDATE admins
                 SET
                 name=?,
                 username=?
                 WHERE id=1`,

                [
                    name,
                    username
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
                        message:"Profile Updated Successfully."

                    });

                }

            );

        }

        // Update name + username + password
        else {

            const hashedPassword =
                await bcrypt.hash(password,10);

            db.query(

                `UPDATE admins
                 SET
                 name=?,
                 username=?,
                 password=?
                 WHERE id=1`,

                [

                    name,
                    username,
                    hashedPassword

                ],

                (err)=>{

                    if(err){

                        return res.status(500).json({

                            success:false,
                            message:"Database Error",
                            error:err

                        });

                    }

                    res.json({

                        success:true,
                        message:"Profile Updated Successfully."

                    });

                }

            );

        }

    }

    catch(error){

        res.status(500).json({

            success:false,
            message:"Server Error",
            error

        });

    }

};