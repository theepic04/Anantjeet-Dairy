const db = require("../config/db");
const bcrypt = require("bcrypt");

const loginAdmin = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: "Username and password are required."
        });
    }

    const sql = "SELECT * FROM admins WHERE username = ?";

    db.query(sql, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });
        }

        const admin = result[0];

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Username or Password"
            });
        }

        req.session.admin = {
            id: admin.id,
            username: admin.username,
            name: admin.name
        };

        req.session.save((err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Session Error"
                });
            }

            res.status(200).json({
                success: true,
                message: "Login Successful",
                admin: {
                    id: admin.id,
                    username: admin.username,
                    name: admin.name
                }
            });

        });
            });
        };

const logoutAdmin = (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            return res.status(500).json({
                success: false,
                message: "Logout failed."
            });

        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "Logged out successfully."
        });

    });

};

module.exports = {

    loginAdmin,
    logoutAdmin

};