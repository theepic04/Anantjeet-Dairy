const db = require("../config/db");

// Add Product
const addProduct = async (req, res) => {
    try {
        const { product_name, description, price } = req.body;

        // Check if image is uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Product image is required."
            });
        }

        const image = req.file.filename;

        const sql = `
            INSERT INTO products
            (product_name, description, price, image)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [product_name, description, price, image],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database Error"
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Product added successfully."
                });
            }
        );

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};
// Get All Products
const getAllProducts = (req, res) => {

    const sql = "SELECT * FROM products ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });

    });

};
// Update Product
const updateProduct = (req, res) => {

    const { id } = req.params;
    const { product_name, description, price } = req.body;

    let sql;
    let values;

    // If a new image is uploaded
    if (req.file) {

        sql = `
            UPDATE products
            SET
                product_name = ?,
                description = ?,
                price = ?,
                image = ?
            WHERE id = ?
        `;

        values = [
            product_name,
            description,
            price,
            req.file.filename,
            id
        ];

    } else {

        sql = `
            UPDATE products
            SET
                product_name = ?,
                description = ?,
                price = ?
            WHERE id = ?
        `;

        values = [
            product_name,
            description,
            price,
            id
        ];
    }

    db.query(sql, values, (err) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        res.json({
            success: true,
            message: "Product updated successfully."
        });

    });

};
// Delete Product
const deleteProduct = (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM products WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {

            console.error(err);

            if (err.code === "ER_ROW_IS_REFERENCED_2") {
                return res.status(400).json({
                    success: false,
                    message: "This product cannot be deleted because it is used in existing orders."
                });
            }

            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json({
            success: true,
            message: "Product deleted successfully."
        });

    });

};
module.exports = {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct
};