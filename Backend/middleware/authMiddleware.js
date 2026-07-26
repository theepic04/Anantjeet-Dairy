const requireAdmin = (req, res, next) => {

    if (!req.session.admin) {

        return res.status(401).json({
            success: false,
            message: "Unauthorized. Please login first."
        });

    }

    next();

};

module.exports = requireAdmin;