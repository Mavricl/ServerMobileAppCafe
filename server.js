const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

app.listen(port, () => {
    console.log("Server running on port", port);
});

// GET all menu items
app.get("/allitems", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT * FROM menu");
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error (allitems)" });
    } finally {
        if (connection) await connection.end();
    }
});

// ADD menu item
app.post("/additem", async (req, res) => {
    const { item, price, image_url } = req.body;

    if (!item || price === undefined || !image_url) {
        return res.status(400).json({ message: "item, price, image_url are required" });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute(
            "INSERT INTO menu (item, price, image_url) VALUES (?, ?, ?)",
            [item, price, image_url]
        );

        res.status(201).json({ message: "Item added", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error (additem)" });
    } finally {
        if (connection) await connection.end();
    }
});

// DELETE item
app.delete("/deleteitem/:id", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        const [result] = await connection.execute("DELETE FROM menu WHERE id = ?", [
            req.params.id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error (deleteitem)" });
    } finally {
        if (connection) await connection.end();
    }
});

// UPDATE item
app.put("/updateitem/:id", async (req, res) => {
    const { item, price, image_url } = req.body;

    if (!item || price === undefined || !image_url) {
        return res.status(400).json({ message: "item, price, image_url are required" });
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

        res.status(200).json({ message: "Item updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error (updateitem)" });
    } finally {
        if (connection) await connection.end();
    }
});
