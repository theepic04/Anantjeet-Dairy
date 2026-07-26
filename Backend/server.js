require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const db = require("./config/db");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const queryRoutes = require("./routes/queryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminProfileRoutes = require("./routes/adminProfileRoutes");


const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:5000",
    credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../Frontend")));
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/queries",queryRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/reviews",reviewRoutes);
app.use("/api/settings",settingsRoutes);
app.use("/api/admin",adminProfileRoutes);

// Test Route

// Start Server
app.use("/uploads", express.static("uploads"));
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});