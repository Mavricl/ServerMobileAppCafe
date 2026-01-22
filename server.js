const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(express.json());

// Database config
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

// START SERVER
app.listen(port, () => {
  console.log("Server running on port", port);
});

// GET all menu items
app.get("/allitems", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      "SELECT * FROM defaultdb.menu"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ADD menu item
app.post("/additem", async (req, res) => {
  const { item, price, image_url } = req.body;

  if (!item || price === undefined || !image_url) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "INSERT INTO defaultdb.menu (item, price, image_url) VALUES (?, ?, ?)",
      [item, price, image_url]
    );
    res.json({ message: "Item added" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE item
app.delete("/deleteitem/:id", async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "DELETE FROM defaultdb.menu WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE item
app.put("/updateitem/:id", async (req, res) => {
  const { item, price, image_url } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      "UPDATE defaultdb.menu SET item=?, price=?, image_url=? WHERE id=?",
      [item, price, image_url, req.params.id]
    );
    res.json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

