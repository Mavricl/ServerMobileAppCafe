const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Database config
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, // should be defaultdb
    port: process.env.DB_PORT,
};

// Start server
app.listen(port, () => {
    console.log("Server running on port", port);
});

/* =========================
   GET all menu items
========================= */
app.get("/allitems", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT * FROM menu");
        res.status(200).json(rows);
    } catch (err) {
        console.error("GET ERROR:", err);
        res.status(500).json({
            message: "Server error (allitems)",
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

/* =========================
   ADD menu item
========================= */
app.post("/additem", async (req, res) => {
    const { item, price, image_url } = req.body;

    if (!item || price === undefined || !image_url) {
        return res.status(400).json({
            message: "item, price, image_url are required",
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "INSERT INTO menu (item, price, image_url) VALUES (?, ?, ?)",
            [item, price, image_url]
        );

        res.status(201).json({
            message: "Item added successfully",
            id: result.insertId,
        });
    } catch (err) {
        console.error("ADD ERROR:", err);
        res.status(500).json({
            message: "Server error (additem)",
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

/* =========================
   DELETE menu item
========================= */
app.delete("/deleteitem/:id", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "DELETE FROM menu WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted successfully" });
    } catch (err) {
        console.error("DELETE ERROR:", err);
        res.status(500).json({
            message: "Server error (deleteitem)",
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});

/* =========================
   UPDATE menu item
========================= */
app.put("/updateitem/:id", async (req, res) => {
    const { item, price, image_url } = req.body;

    if (!item || price === undefined || !image_url) {
        return res.status(400).json({
            message: "item, price, image_url are required",
        });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "UPDATE menu SET item = ?, price = ?, image_url = ? WHERE id = ?",
            [item, price, image_url, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item updated successfully" });
    } catch (err) {
        console.error("UPDATE ERROR:", err);
        res.status(500).json({
            message: "Server error (updateitem)",
            error: err.message,
        });
    } finally {
        if (connection) await connection.end();
    }
});
