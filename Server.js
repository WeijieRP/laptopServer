const express = require("express");
const mysql2 = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.DB_PORT || 3000;

const dbConfig = mysql2.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectTimeout: 10000,
});

// CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.REACT_APP_API_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

// GET
app.get("/laptop", async (req, res) => {
  try {
    const [rows] = await dbConfig.execute("SELECT * FROM laptops");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No records found" });
    }

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// POST
app.post("/laptop", async (req, res) => {
  try {
    const { name, model, price, qty } = req.body;

    const [rows] = await dbConfig.execute(
      "INSERT INTO laptops (name, model, price, qty) VALUES (?, ?, ?, ?)",
      [name, model, price, qty]
    );

    return res.status(201).json({
      message: "Inserted successfully",
      id: rows.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// PUT
app.put("/laptop/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, model, price, qty } = req.body;

    const [rows] = await dbConfig.execute(
      "UPDATE laptops SET name=?, model=?, price=?, qty=? WHERE id=?",
      [name, model, price, qty, id]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Laptop not found" });
    }

    return res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// DELETE
app.delete("/laptop/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [rows] = await dbConfig.execute(
      "DELETE FROM laptops WHERE id=?",
      [id]
    );

    if (rows.affectedRows === 0) {
      return res.status(404).json({ message: "Laptop not found" });
    }

    return res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// 404
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running at PORT ${PORT}`);
});